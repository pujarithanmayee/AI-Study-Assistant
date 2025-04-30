import os
import tempfile
import shutil
import base64
import asyncio
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from langchain_community.document_loaders import PyPDFLoader
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_community.llms import Ollama
from src.helper import extract_images_from_pdf
from src.database import SessionLocal, init_db
from src import crud
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

@app.on_event("startup")
def init():
    print("Initializing database connection...")
    init_db()
    print("Database initialized.")
    app.state.session_dir = None
    app.state.db = None
    app.state.image_folder = None
    app.state.image_cache = {}  # Initialize image cache for base64 images
    print("Startup event complete")
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/upload_pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    if app.state.session_dir:
        shutil.rmtree(app.state.session_dir, ignore_errors=True)

    temp_dir = tempfile.mkdtemp()
    pdf_path = os.path.join(temp_dir, file.filename)

    with open(pdf_path, "wb") as f:
        f.write(await file.read())

    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    # Add page numbers as metadata to each document
    for i, doc in enumerate(documents):
        doc.metadata['page_number'] = i + 1  # Page numbers are 1-based

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    db = FAISS.from_documents(documents, embeddings)
    app.state.db = db

    image_folder = os.path.join(temp_dir, "images")
    os.makedirs(image_folder, exist_ok=True)
    extract_images_from_pdf(pdf_path, image_folder)

    # Preprocess and cache images in base64 format
    for file_name in os.listdir(image_folder):
        image_path = os.path.join(image_folder, file_name)
        app.state.image_cache[file_name] = encode_image_to_base64(image_path)

    app.state.session_dir = temp_dir
    app.state.image_folder = image_folder

    return JSONResponse({"message": "PDF processed successfully!"})


@app.post("/ask/")
async def ask_question(query: str = Form(...)):
    if not hasattr(app.state, "db") or app.state.db is None:
        return JSONResponse({"error": "No PDF uploaded yet."}, status_code=400)

    retriever = app.state.db.as_retriever()
    llm = Ollama(model="mistral")

    def get_answer():
        qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
        return qa.run(query)

    result = await asyncio.to_thread(get_answer)

    # Extract relevant documents and their metadata
    relevant_docs = retriever.get_relevant_documents(query)

    images = []
    page_numbers = []

    # Collect page numbers and base64 images from metadata of relevant documents
    for doc in relevant_docs:
        page_number = doc.metadata.get('page_number')
        if page_number:
            page_numbers.append(page_number)
            # Instead of calling the image URL, fetch the base64 from the cache
            for file_name in app.state.image_cache:
                if file_name.startswith(f"page_{page_number}_"):
                    images.append(app.state.image_cache[file_name])

    return {
        "answer": result,
        "page_numbers": page_numbers,
        "images": images
    }


@app.get("/clear_memory/")
def clear_memory():
    if app.state.session_dir:
        shutil.rmtree(app.state.session_dir, ignore_errors=True)
    app.state.session_dir = None
    app.state.db = None
    app.state.image_folder = None
    app.state.image_cache = {}  # Clear cached images
    return {"message": "Session cleared."}


def encode_image_to_base64(image_path: str):
    with open(image_path, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode("utf-8")
    return f"data:image/jpeg;base64,{encoded_image}"


@app.get("/images/{image_name}")
async def serve_image(image_name: str):
    if image_name in app.state.image_cache:
        return JSONResponse({"image_data": app.state.image_cache[image_name]})
    raise HTTPException(status_code=404, detail="Image not found")


# Notes CRUD APIs

@app.post("/notes/")
def save_note(title: str = Form(...), content: str = Form(...), db: Session = Depends(get_db)):
    return crud.create_note(db, title, content)


@app.get("/notes/")
def list_notes(db: Session = Depends(get_db)):
    return crud.get_notes(db)


@app.get("/notes/{note_id}")
def read_note(note_id: int, db: Session = Depends(get_db)):
    return crud.get_note_by_id(db, note_id)


@app.put("/notes/{note_id}")
def edit_note(note_id: int, title: str = Form(...), content: str = Form(...), db: Session = Depends(get_db)):
    return crud.update_note(db, note_id, title, content)


@app.delete("/notes/{note_id}")
def remove_note(note_id: int, db: Session = Depends(get_db)):
    return crud.delete_note(db, note_id)
