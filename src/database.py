from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/rag_notes"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Run once to create the table
def init_db():
    Base.metadata.create_all(bind=engine)
