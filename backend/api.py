from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from langchain_community.document_loaders import Docx2txtLoader, UnstructuredWordDocumentLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
import os, shutil
from fastapi.middleware.cors import CORSMiddleware

INDEX_PATH = "faiss_index"
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

# Load existing FAISS or create new
if os.path.exists(INDEX_PATH):
    vectorstore = FAISS.load_local(INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
else:
    vectorstore = FAISS.from_documents([], embeddings)

retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
qa_chain = ConversationalRetrievalChain.from_llm(
    llm=ChatOpenAI(model="gpt-4o", temperature=0.7, max_tokens=1000),
    retriever=retriever,
    return_source_documents=True
)

chat_history = []
app = FastAPI()

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
    else:
        return {"status": f"❌ Unsupported file type: {ext}"}

    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)

    vectorstore.add_documents(chunks)
    vectorstore.save_local(INDEX_PATH)

    return {"status": f"✅ {file.filename} uploaded & indexed successfully!"}

# ---- Ask Questions ----
class Query(BaseModel):
    question: str

@app.post("/ask")
def ask(query: Query):
    global chat_history
    result = qa_chain({"question": query.question, "chat_history": chat_history})
    chat_history.append((query.question, result["answer"]))
    return {"answer": result["answer"]}