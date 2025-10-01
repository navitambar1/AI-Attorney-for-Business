from langchain_community.document_loaders import Docx2txtLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from dotenv import load_dotenv
import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


load_dotenv()

DOC_PATH = "EggBred 2025 FDD (09-16-25).docx"
INDEX_PATH = "faiss_index"

def create_session_with_retries():
    """Create a requests session with retry logic for better network reliability."""
    session = requests.Session()
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

def build_index():
    print("Loading document...")
    loader = Docx2txtLoader(DOC_PATH)
    docs = loader.load()

    print("Splitting into chunks...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)

    print("Creating embeddings...")
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found in environment variables.")
        print("Please create a .env file with your OpenAI API key:")
        print("OPENAI_API_KEY=your_api_key_here")
        return
    
   
    try:
        embeddings = OpenAIEmbeddings(
            model="text-embedding-3-large", 
            openai_api_key=api_key,
            request_timeout=60, 
            max_retries=3  
        )
        
        print("Creating vector store...")
        vectorstore = FAISS.from_documents(chunks, embeddings)

        print(f"Saving FAISS index to {INDEX_PATH} ...")
        vectorstore.save_local(INDEX_PATH)

        print("Index build complete!")
        
    except Exception as e:
        print(f"Error creating embeddings: {e}")
        print("\nTroubleshooting tips:")
        print("1. Check your internet connection")
        print("2. Verify your OpenAI API key is correct")
        print("3. Check if you have sufficient OpenAI credits")
        print("4. Try running the script again in a few minutes")

if __name__ == "__main__":
    build_index()
