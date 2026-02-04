"""
SentinelAI Configuration
"""
import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
REPORTS_DIR = BASE_DIR / "reports"

# Create directories if they don't exist
DATA_DIR.mkdir(exist_ok=True)
REPORTS_DIR.mkdir(exist_ok=True)

# Database
DATABASE_URL = f"sqlite:///{BASE_DIR}/sentinelai.db"

# Dataset configurations
DATASET_SIZE = 1000

# Risk thresholds
RISK_THRESHOLDS = {
    "PASS": (0, 40),
    "WARNING": (40, 70),
    "FAIL": (70, 100)
}

# Risk weights for composite score
RISK_WEIGHTS = {
    "bias": 0.40,
    "drift": 0.35,
    "explainability": 0.25
}

# Disparate Impact threshold (80% rule)
DI_THRESHOLD = 0.8

# API Settings
API_V1_PREFIX = "/api/v1"
