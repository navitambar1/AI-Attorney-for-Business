# import os
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_community.document_loaders import Docx2txtLoader
# from langchain_openai import OpenAIEmbeddings, ChatOpenAI
# from langchain.vectorstores import FAISS
# from langchain.chains import RetrievalQA

# # 1. Load the document
# loader = Docx2txtLoader("EggBred 2025 FDD.docx")
# docs = loader.load()

# # 2. Split document into chunks
# splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
# chunks = splitter.split_documents(docs)

# # 3. Create embeddings and FAISS index
# embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
# vectorstore = FAISS.from_documents(chunks, embeddings)

# # 4. Setup retriever + QA chain
# retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
# qa_chain = RetrievalQA.from_chain_type(
#     llm=ChatOpenAI(model="gpt-4o"),
#     retriever=retriever
# )

# print("🤖 EggBred Chatbot is ready! Type 'exit' to quit.\n")

# # 5. Chat loop
# while True:
#     query = input("You: ")
#     if query.lower() in ["exit", "quit"]:
#         print("Chatbot: Goodbye!")
#         break
#     answer = qa_chain.run(query)
#     print(f"Chatbot: {answer}\n")