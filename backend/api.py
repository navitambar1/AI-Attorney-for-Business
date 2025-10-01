from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from langchain_community.document_loaders import Docx2txtLoader, UnstructuredWordDocumentLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
import os, shutil
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import tempfile
import uuid
import time

# Load environment variables from .env file
load_dotenv()

INDEX_PATH = "faiss_index"
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Load existing FAISS or create new
if os.path.exists(INDEX_PATH):
    vectorstore = FAISS.load_local(INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=ChatOpenAI(
            model="gpt-4o", 
            temperature=0.7, 
            max_tokens=1000,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        ),
        retriever=retriever,
        return_source_documents=True
    )
else:
    # No index exists yet, will be created when first document is uploaded
    vectorstore = None
    retriever = None
    qa_chain = None

chat_history = []
# Store temporary vector stores for each conversation session
conversation_stores = {}
app = FastAPI()

def cleanup_old_sessions():
    """Remove conversation stores older than 1 hour"""
    current_time = time.time()
    sessions_to_remove = []
    
    for session_id, store in conversation_stores.items():
        if hasattr(store, 'created_at') and current_time - store.get('created_at', 0) > 3600:  # 1 hour
            sessions_to_remove.append(session_id)
    
    for session_id in sessions_to_remove:
        del conversation_stores[session_id]

def process_uploaded_file(file: UploadFile) -> FAISS:
    """Process uploaded file and return a FAISS vector store"""
    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as tmp_file:
        shutil.copyfileobj(file.file, tmp_file)
        tmp_path = tmp_file.name
    
    try:
        # Choose loader by extension
        ext = file.filename.lower().split(".")[-1]
        if ext in ["docx"]:
            loader = Docx2txtLoader(tmp_path)
            docs = loader.load()
        elif ext in ["doc"]:
            loader = UnstructuredWordDocumentLoader(tmp_path)
            docs = loader.load()
        elif ext in ["pdf"]:
            loader = PyPDFLoader(tmp_path)
            docs = loader.load()
        elif ext in ["txt"]:
            # For text files, read directly
            from langchain.schema import Document
            with open(tmp_path, "r", encoding="utf-8") as f:
                content = f.read()
            docs = [Document(page_content=content, metadata={"source": file.filename})]
        else:
            raise ValueError(f"Unsupported file type: {ext}")
        
        # Split into chunks
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_documents(docs)
        
        # Create vector store
        temp_vectorstore = FAISS.from_documents(chunks, embeddings)
        
        return temp_vectorstore
        
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Upload new file ----
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Choose loader by extension
    ext = file.filename.lower().split(".")[-1]
    if ext in ["docx"]:
        loader = Docx2txtLoader(file_path)
    elif ext in ["doc"]:
        loader = UnstructuredWordDocumentLoader(file_path)
    elif ext in ["pdf"]:
        loader = PyPDFLoader(file_path)
    elif ext in ["txt"]:
        # For text files, we'll read them directly
        from langchain.schema import Document
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        docs = [Document(page_content=content, metadata={"source": file.filename})]
    else:
        return {"status": f"❌ Unsupported file type: {ext}"}

    # Load documents based on file type
    if ext == "txt":
        # docs already created above for text files
        pass
    else:
        docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)

    vectorstore.add_documents(chunks)
    vectorstore.save_local(INDEX_PATH)

    return {"status": f"✅ {file.filename} uploaded & indexed successfully!"}

# ---- Ask Questions ----
class Query(BaseModel):
    question: str
    session_id: str = None

@app.post("/ask")
async def ask(
    question: str = Form(None),
    file: UploadFile = File(None),
    session_id: str = Form(None)
):
    global chat_history
    
    # Generate session ID if not provided
    if not session_id:
        session_id = str(uuid.uuid4())
    
    # Clean up old sessions periodically
    cleanup_old_sessions()
    
    # Initialize conversation store if not exists
    if session_id not in conversation_stores:
        conversation_stores[session_id] = {
            "vectorstore": vectorstore,
            "chat_history": [],
            "created_at": time.time()
        }
    
    current_store = conversation_stores[session_id]
    current_chat_history = current_store["chat_history"]
    
    # If file is uploaded, process it and update the vector store for this session
    if file:
        try:
            temp_vectorstore = process_uploaded_file(file)
            # Merge with existing vector store
            if current_store["vectorstore"] is not None:
                current_store["vectorstore"].merge_from(temp_vectorstore)
            else:
                current_store["vectorstore"] = temp_vectorstore
            
            # Update retriever and QA chain for this session
            retriever = current_store["vectorstore"].as_retriever(search_kwargs={"k": 4})
            session_qa_chain = ConversationalRetrievalChain.from_llm(
                llm=ChatOpenAI(
                    model="gpt-4o", 
                    temperature=0.7, 
                    max_tokens=1000,
                    openai_api_key=os.getenv("OPENAI_API_KEY")
                ),
                retriever=retriever,
                return_source_documents=True
            )
            
            # If no question provided, just return success message
            if not question:
                return {
                    "answer": f"✅ File '{file.filename}' uploaded successfully! You can now ask questions about this document.",
                    "session_id": session_id
                }
        except Exception as e:
            return {"answer": f"❌ Error processing file: {str(e)}", "session_id": session_id}
    
    # If no question provided, return error
    if not question:
        return {"answer": "Please provide a question or upload a file.", "session_id": session_id}
    
    # Use session-specific QA chain or default
    if current_store["vectorstore"] is not None:
        retriever = current_store["vectorstore"].as_retriever(search_kwargs={"k": 4})
        session_qa_chain = ConversationalRetrievalChain.from_llm(
            llm=ChatOpenAI(
                model="gpt-4o", 
                temperature=0.7, 
                max_tokens=1000,
                openai_api_key=os.getenv("OPENAI_API_KEY")
            ),
            retriever=retriever,
            return_source_documents=True
        )
        result = session_qa_chain({"question": question, "chat_history": current_chat_history})
    else:
        # Use global QA chain if no session-specific store
        if qa_chain is None:
            return {
                "answer": "No documents have been uploaded yet. Please upload a document first to ask questions about it.",
                "session_id": session_id
            }
        result = qa_chain({"question": question, "chat_history": current_chat_history})
    
    # Update chat history for this session
    current_chat_history.append((question, result["answer"]))
    
    return {
        "answer": result["answer"],
        "session_id": session_id
    }