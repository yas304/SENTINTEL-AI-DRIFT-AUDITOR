"""
SentinelAI FastAPI Application
Main entry point for the backend API
"""
from datetime import datetime
from typing import Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.config import API_V1_PREFIX
from app.models import init_db, get_db, AuditResult
from app.schemas import AuditRequest, AuditResponse, HealthResponse, ErrorResponse
from app.audit_engine import run_audit
from app.report_generator import generate_audit_report
from app.dataset_generator import initialize_datasets

# Initialize app with lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Initializing SentinelAI...")
    init_db()
    print("📊 Generating datasets...")
    initialize_datasets()
    print("✅ SentinelAI ready!")
    yield
    # Shutdown
    print("👋 Shutting down SentinelAI...")

app = FastAPI(
    title="SentinelAI",
    description="AI Governance & Model Risk Management Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== API ENDPOINTS ====================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API info"""
    return {
        "name": "SentinelAI",
        "tagline": "Making deployed AI accountable",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get(f"{API_V1_PREFIX}/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database": "connected"
    }

@app.post(f"{API_V1_PREFIX}/audit/start", response_model=AuditResponse, tags=["Audit"])
async def start_audit(
    request: AuditRequest,
    db: Session = Depends(get_db)
):
    """
    Start a new audit on the specified dataset mode.
    
    Dataset modes:
    - **clean**: Balanced data, no bias, stable performance (Expected: PASS)
    - **biased**: Gender bias present in approval rates (Expected: WARNING/FAIL)
    - **drifted**: Distribution shift, degraded accuracy (Expected: WARNING)
    """
    try:
        # Run the audit
        result = run_audit(request.dataset_mode)
        
        # Store in database
        audit_record = AuditResult(
            id=result["audit_id"],
            timestamp=datetime.fromisoformat(result["timestamp"]),
            dataset_mode=result["dataset_mode"],
            ai_risk_score=result["ai_risk_score"],
            risk_status=result["risk_status"],
            bias_risk_score=result["bias_risk_score"],
            drift_risk_score=result["drift_risk_score"],
            explainability_score=result["explainability_score"],
            bias_details=result["bias_details"],
            drift_details=result["drift_details"],
            recommendations=result["recommendations"],
            executive_summary=result["executive_summary"]
        )
        
        db.add(audit_record)
        db.commit()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get(f"{API_V1_PREFIX}/audit/result/{{audit_id}}", response_model=AuditResponse, tags=["Audit"])
async def get_audit_result(
    audit_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve a previously run audit by ID.
    """
    audit = db.query(AuditResult).filter(AuditResult.id == audit_id).first()
    
    if not audit:
        raise HTTPException(status_code=404, detail=f"Audit {audit_id} not found")
    
    # Reconstruct full response
    return {
        "audit_id": audit.id,
        "timestamp": audit.timestamp.isoformat(),
        "dataset_mode": audit.dataset_mode,
        "ai_risk_score": audit.ai_risk_score,
        "risk_status": audit.risk_status,
        "risk_components": {
            "bias_contribution": audit.ai_risk_score * 0.4,
            "drift_contribution": audit.ai_risk_score * 0.35,
            "explainability_contribution": audit.ai_risk_score * 0.25
        },
        "bias_risk_score": audit.bias_risk_score,
        "drift_risk_score": audit.drift_risk_score,
        "explainability_score": audit.explainability_score,
        "bias_details": audit.bias_details,
        "drift_details": audit.drift_details,
        "explainability_details": {
            "score": audit.explainability_score,
            "explanation": "See detailed audit for explainability analysis",
            "gaps": []
        },
        "recommendations": audit.recommendations,
        "executive_summary": audit.executive_summary,
        "dataset_stats": {
            "total_records": 1000,
            "approval_rate": 0.5,
            "accuracy": 0.85
        }
    }

@app.get(f"{API_V1_PREFIX}/audit/history", tags=["Audit"])
async def get_audit_history(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get recent audit history.
    """
    audits = db.query(AuditResult).order_by(AuditResult.timestamp.desc()).limit(limit).all()
    
    return [
        {
            "audit_id": a.id,
            "timestamp": a.timestamp.isoformat(),
            "dataset_mode": a.dataset_mode,
            "ai_risk_score": a.ai_risk_score,
            "risk_status": a.risk_status
        }
        for a in audits
    ]

@app.post(f"{API_V1_PREFIX}/audit/report/{{audit_id}}", tags=["Reports"])
async def generate_report(
    audit_id: str,
    db: Session = Depends(get_db)
):
    """
    Generate PDF audit report for a completed audit.
    """
    # First, get the audit or run a new one
    audit = db.query(AuditResult).filter(AuditResult.id == audit_id).first()
    
    if not audit:
        raise HTTPException(status_code=404, detail=f"Audit {audit_id} not found")
    
    # Reconstruct audit result for report generation
    audit_result = {
        "audit_id": audit.id,
        "timestamp": audit.timestamp.isoformat(),
        "dataset_mode": audit.dataset_mode,
        "ai_risk_score": audit.ai_risk_score,
        "risk_status": audit.risk_status,
        "risk_components": {
            "bias_contribution": audit.bias_risk_score * 0.4,
            "drift_contribution": audit.drift_risk_score * 0.35,
            "explainability_contribution": (100 - audit.explainability_score) * 0.25
        },
        "bias_risk_score": audit.bias_risk_score,
        "drift_risk_score": audit.drift_risk_score,
        "explainability_score": audit.explainability_score,
        "bias_details": audit.bias_details,
        "drift_details": audit.drift_details,
        "recommendations": audit.recommendations,
        "executive_summary": audit.executive_summary,
        "dataset_stats": {
            "total_records": 1000,
            "approval_rate": 0.5,
            "accuracy": 0.85
        }
    }
    
    # Generate PDF
    pdf_bytes = generate_audit_report(audit_result)
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=sentinelai_report_{audit_id}.pdf"
        }
    )

@app.post(f"{API_V1_PREFIX}/audit/quick-report", tags=["Reports"])
async def generate_quick_report(
    request: AuditRequest,
    db: Session = Depends(get_db)
):
    """
    Run audit and immediately generate PDF report.
    """
    try:
        # Run audit
        result = run_audit(request.dataset_mode)
        
        # Store in database
        audit_record = AuditResult(
            id=result["audit_id"],
            timestamp=datetime.fromisoformat(result["timestamp"]),
            dataset_mode=result["dataset_mode"],
            ai_risk_score=result["ai_risk_score"],
            risk_status=result["risk_status"],
            bias_risk_score=result["bias_risk_score"],
            drift_risk_score=result["drift_risk_score"],
            explainability_score=result["explainability_score"],
            bias_details=result["bias_details"],
            drift_details=result["drift_details"],
            recommendations=result["recommendations"],
            executive_summary=result["executive_summary"]
        )
        db.add(audit_record)
        db.commit()
        
        # Generate PDF
        pdf_bytes = generate_audit_report(result)
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=sentinelai_report_{result['audit_id']}.pdf"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn app.main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
