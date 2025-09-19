from langchain_community.document_loaders import Docx2txtLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter

DOC_PATH = "EggBred 2025 FDD (09-16-25).docx"
INDEX_PATH = "faiss_index"

def build_index():
    print("Loading document...")
    loader = Docx2txtLoader(DOC_PATH)
    docs = loader.load()

    print("Splitting into chunks...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)

    print("Creating embeddings...")
    embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

    vectorstore = FAISS.from_documents(chunks, embeddings)

    print(f"Saving FAISS index to {INDEX_PATH} ...")
    vectorstore.save_local(INDEX_PATH)

    print("Index build complete!")

if __name__ == "__main__":
    build_index()
