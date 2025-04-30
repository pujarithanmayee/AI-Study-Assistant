import os
import pickle
import faiss
import numpy as np
from PyPDF2 import PdfReader
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

# === PATHS ===
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # chatbot/
DATA_DIR = os.path.join(BASE_DIR, "data")              # chatbot/data
INDEX_DIR = os.path.join(BASE_DIR, "faiss_index")      # chatbot/faiss_index
INDEX_PATH = os.path.join(INDEX_DIR, "index.pkl")      # chatbot/faiss_index/index.pkl

# === Load Model ===
model = SentenceTransformer("all-MiniLM-L6-v2")

def read_and_chunk_pdfs(folder_path):
    docs = []

    for file in os.listdir(folder_path):
        if file.endswith(".pdf"):
            reader = PdfReader(os.path.join(folder_path, file))
            for page_number, page in enumerate(reader.pages, start=1):
                text = page.extract_text()
                if not text:
                    continue
                if "acne" in text.lower():
                    print(f"✅ Found 'acne' on Page {page_number} of {file}")
                docs.append(Document(page_content=text, metadata={"source": file, "page_number": page_number}))

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)
    split_docs = text_splitter.split_documents(docs)

    # Convert back to your expected chunk_data format
    chunk_data = []
    for i, doc in enumerate(split_docs):
        chunk_data.append({
            "text": doc.page_content,
            "source": doc.metadata["source"],
            "page_number": doc.metadata["page_number"],
            "chunk_id": i
        })

    return chunk_data

def build_or_update_faiss_index():
    if not os.path.exists(INDEX_DIR):
        os.makedirs(INDEX_DIR)

    chunk_data = read_and_chunk_pdfs(DATA_DIR)
    print(f"Total raw chunks: {len(chunk_data)}")

    # Identify and filter bad text chunks
    valid_chunks = []
    for item in chunk_data:
        text = item["text"]
        if isinstance(text, str) and text.strip():
            valid_chunks.append((text.strip(), item))
        else:
            print(f"Skipped invalid chunk from {item.get('source', 'unknown')}")

    if not valid_chunks:
        print("No valid text chunks to process. Exiting.")
        return

    texts, metadatas = zip(*valid_chunks)
    texts = list(texts)
    metadatas = list(metadatas)

    print(f"Total valid chunks to embed: {len(texts)}")
    print("Checking for problematic chunks individually...")

    from tqdm import tqdm

    working_texts = []
    working_metadatas = []

    for text, meta in tqdm(zip(texts, metadatas), total=len(texts)):
        try:
            model.encode([text], normalize_embeddings=True)
            working_texts.append(text)
            working_metadatas.append(meta)
        except Exception as e:
            print(f"Failed to encode chunk from {meta.get('source', 'unknown')} (chunk_id={meta.get('chunk_id')})")
            print(f"   Error: {e}")
            print(f"   Text Preview: {repr(text[:100])}")  # Preview the chunk that failed

    print(f"Cleaned and valid chunks: {len(working_texts)}")

    print("Embedding valid chunks in batch...")

    embeddings = model.encode(
        working_texts,
        normalize_embeddings=True,
        batch_size=32,
        show_progress_bar=True
    )


    # === FAISS Index logic ===
    if os.path.exists(INDEX_PATH):
        print("Appending to existing index...")
        with open(INDEX_PATH, "rb") as f:
            index, old_data = pickle.load(f)
        index.add(np.array(embeddings))
        all_data = list(old_data) + metadatas
    else:
        print("Creating new FAISS index...")
        index = faiss.IndexFlatIP(embeddings.shape[1])
        index.add(np.array(embeddings))
        all_data = metadatas

    with open(INDEX_PATH, "wb") as f:
        pickle.dump((index, all_data), f)

    print(f"FAISS index saved successfully with {len(all_data)} total chunks.")

if __name__ == "__main__":
    build_or_update_faiss_index()
