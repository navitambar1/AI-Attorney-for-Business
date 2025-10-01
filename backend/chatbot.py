from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# inside load_bot():
# retriever = vectorstore.as_retriever(search_kwargs={"k": 3})



INDEX_PATH = "faiss_index"

def load_bot():
    print("📂 Loading FAISS index...")
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-large",
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    vectorstore = FAISS.load_local(INDEX_PATH, embeddings, allow_dangerous_deserialization=True)

    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=ChatOpenAI(
            model="gpt-4o",
            openai_api_key=os.getenv("OPENAI_API_KEY")
        ),
        retriever=retriever,
        memory=memory
    )
    # qa_chain = RetrievalQA.from_chain_type(
    #     llm=ChatOpenAI(model="gpt-4o"),
    #     retriever=retriever
    # )
    return qa_chain

if __name__ == "__main__":
    qa_chain = load_bot()
    print("🤖 EggBred Chatbot is ready! Type 'exit' to quit.\n")

    while True:
        query = input("You: ")
        if query.lower() in ["exit", "quit"]:
            print("Chatbot: Goodbye!")
            break
        answer = qa_chain.run(query)
        print(f"Chatbot: {answer}\n")

