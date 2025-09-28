from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Create a directory for the database if it doesn't exist
os.makedirs(os.path.dirname(os.path.abspath(__file__)) + "/../data", exist_ok=True)

# Use SQLite instead of MySQL
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:root@localhost/HR_Asset_Tracker_New"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
