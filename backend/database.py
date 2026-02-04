from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./rucode.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class LessonDB(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer)  # <-- Важное поле
    title = Column(String)
    description = Column(String)
    question = Column(String)
    options = Column(JSON)
    correct_answer = Column(String)
    explanation = Column(String) # <-- И это поле обязательно!

def create_db():
    Base.metadata.create_all(bind=engine)