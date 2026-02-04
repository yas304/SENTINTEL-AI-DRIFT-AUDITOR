"""
Database Models for SentinelAI
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL

Base = declarative_base()

class AuditResult(Base):
    """Stores audit results for reproducibility and compliance"""
    __tablename__ = "audit_results"
    
    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    dataset_mode = Column(String, nullable=False)  # clean, biased, drifted
    
    # Core metrics
    ai_risk_score = Column(Float, nullable=False)
    risk_status = Column(String, nullable=False)  # PASS, WARNING, FAIL
    
    # Component scores
    bias_risk_score = Column(Float, nullable=False)
    drift_risk_score = Column(Float, nullable=False)
    explainability_score = Column(Float, nullable=False)
    
    # Detailed metrics (JSON)
    bias_details = Column(JSON)
    drift_details = Column(JSON)
    recommendations = Column(JSON)
    
    # Executive summary
    executive_summary = Column(String)

# Database setup
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
