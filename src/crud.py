from sqlalchemy.orm import Session
from .models import Note

def create_note(db: Session, title: str, content: str):
    note = Note(title=title, content=content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

def get_notes(db: Session):
    return db.query(Note).all()

def get_note_by_id(db: Session, note_id: int):
    return db.query(Note).filter(Note.id == note_id).first()

def update_note(db: Session, note_id: int, title: str, content: str):
    note = db.query(Note).filter(Note.id == note_id).first()
    if note:
        note.title = title
        note.content = content
        db.commit()
    return note

def delete_note(db: Session, note_id: int):
    note = db.query(Note).filter(Note.id == note_id).first()
    if note:
        db.delete(note)
        db.commit()
    return note
