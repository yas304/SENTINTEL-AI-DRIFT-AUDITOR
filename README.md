# 🛡️ SentinelAI

> **Making Deployed AI Accountable**

<div align="center">

![SentinelAI](https://img.shields.io/badge/SentinelAI-AI%20Governance-D4AF37?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Enterprise-grade AI governance platform for bias detection, drift monitoring, and compliance reporting**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API Reference](#-api-reference)

</div>

---

## 🎯 Problem Statement

As AI systems are increasingly deployed in high-stakes domains (hiring, lending, healthcare), organizations face:
- **Regulatory pressure** from EU AI Act, NYC Local Law 144, and EEOC guidelines
- **Reputational risk** from biased AI decisions
- **Technical debt** from model drift going undetected
- **Audit challenges** with no standardized compliance reporting

## 💡 Solution

SentinelAI provides a **unified AI governance dashboard** that:
1. Continuously monitors deployed models for bias and drift
2. Converts complex ML signals into a single **AI Risk Score (0-100)**
3. Generates **audit-ready compliance reports** in seconds
4. Provides **actionable recommendations** ranked by severity

---

## ✨ Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| 🎯 **AI Risk Score** | Composite metric (0-100) combining bias, drift, and explainability |
| ⚖️ **Bias Detection** | Disparate Impact analysis with 80% rule compliance |
| 📉 **Drift Detection** | KS-test based distribution shift detection |
| 🔍 **Explainability** | Feature importance and decision transparency scoring |
| 📋 **Recommendations** | Severity-ranked remediation guidance |
| 📄 **PDF Reports** | Executive-ready audit reports for regulators |
| 🏛️ **Compliance Tracking** | EU AI Act, NIST AI RMF, NYC Law 144, IEEE 7000 |

### Technical Highlights

- ✅ **Real statistical calculations** - No fake metrics, actual bias/drift algorithms
- ✅ **Three demo datasets** - Clean, Biased, and Drifted scenarios
- ✅ **SQLite persistence** - Audit history with full reproducibility
- ✅ **Real-time monitoring** - Live metrics simulation dashboard
- ✅ **Premium UI/UX** - Dark luxury theme with gold accents
- ✅ **Responsive design** - Works on desktop and tablet

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/sentinelai.git
cd sentinelai
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn app.main:app --reload --port 8000
```

✅ Backend running at: **http://localhost:8000**
📚 API Documentation: **http://localhost:8000/docs**

### Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running at: **http://localhost:3000**

### Quick Run Commands

**Windows PowerShell (2 terminals):**
```powershell
# Terminal 1 - Backend
cd backend; .\venv\Scripts\activate; python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend; npm run dev
```

**Mac/Linux (2 terminals):**
```bash
# Terminal 1 - Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

## 📊 Dataset Modes

SentinelAI includes three pre-configured datasets for demonstration:

| Mode | Description | Risk Score | Status | Use Case |
|------|-------------|------------|--------|----------|
| 🟢 **Clean** | Balanced, unbiased data | ~25-35 | PASS | Ideal model state |
| 🟡 **Biased** | Gender bias present (DI < 0.8) | ~65-75 | WARNING/FAIL | Bias detection demo |
| 🟠 **Drifted** | Distribution shift detected | ~45-55 | WARNING | Drift detection demo |

Toggle between modes in the dashboard to see how the AI Risk Score changes.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Dashboard  │  │  Landing    │  │  Components         │  │
│  │  - Risk     │  │  Page       │  │  - RiskGauge        │  │
│  │  - Metrics  │  │             │  │  - MetricCard       │  │
│  │  - Charts   │  │             │  │  - Recommendations  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                           │                                  │
│                    React + TypeScript + Vite                 │
│                    Tailwind CSS + Framer Motion              │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  API Routes │  │  Engines    │  │  Services           │  │
│  │  /audit/*   │  │  - Bias     │  │  - PDF Generation   │  │
│  │  /health    │  │  - Drift    │  │  - Risk Calculator  │  │
│  │             │  │  - Explain  │  │  - Recommendations  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                           │                                  │
│                    FastAPI + Python 3.11                     │
│                    SQLite + NumPy + Pandas                   │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  SQLite DB  │  │  Generated  │  │  PDF Reports        │  │
│  │  (Audits)   │  │  Datasets   │  │  (On-demand)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Reference

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/` | API info | - |
| `POST` | `/audit/start` | Start new audit | `{"dataset_mode": "biased"}` |
| `GET` | `/audit/result/{id}` | Get audit by ID | - |
| `GET` | `/audit/history?limit=10` | Get audit history | - |
| `POST` | `/audit/report/{id}` | Generate PDF report | - |

### Example: Start Audit

```bash
curl -X POST http://localhost:8000/api/v1/audit/start \
  -H "Content-Type: application/json" \
  -d '{"dataset_mode": "biased"}'
```

### Response Structure

```json
{
  "audit_id": "AUDIT-20260204-ABC123",
  "timestamp": "2026-02-04T10:30:00Z",
  "ai_risk_score": 72.5,
  "risk_status": "WARNING",
  "bias_risk_score": 85.2,
  "drift_risk_score": 25.0,
  "explainability_score": 78.5,
  "recommendations": [...],
  "executive_summary": "..."
}
```

---

## 📁 Project Structure

```
sentinelai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── routes.py            # API endpoints
│   │   ├── bias_detection.py    # Disparate Impact calculations
│   │   ├── drift_detection.py   # KS-test distribution analysis
│   │   ├── explainability.py    # Feature importance scoring
│   │   ├── risk_calculator.py   # AI Risk Score computation
│   │   ├── recommendations.py   # Remediation engine
│   │   ├── pdf_generator.py     # Report generation
│   │   ├── dataset_generator.py # Demo data creation
│   │   ├── database.py          # SQLite persistence
│   │   └── config.py            # Configuration constants
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx       # Main dashboard view
│   │   │   ├── LandingPage.tsx     # Entry page
│   │   │   ├── RiskGauge.tsx       # Animated risk meter
│   │   │   ├── MetricCard.tsx      # Score display cards
│   │   │   ├── CompliancePanel.tsx # Regulatory compliance
│   │   │   ├── RealTimeMonitor.tsx # Live metrics
│   │   │   ├── ModelHealth.tsx     # Health visualization
│   │   │   └── ...
│   │   ├── api.ts              # API client
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── App.tsx             # Root component
│   │   └── index.css           # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── README.md
```

---

## 🧪 Bias Detection Algorithm

SentinelAI uses the **Disparate Impact (DI) Ratio** for bias detection:

```
DI = (Favorable outcome rate for unprivileged group) / (Favorable outcome rate for privileged group)
```

**Compliance Threshold:** DI ≥ 0.8 (80% rule from EEOC guidelines)

### Example:
- Male approval rate: 70%
- Female approval rate: 40%
- DI = 0.40 / 0.70 = **0.57** ❌ (Below threshold)

---

## 📈 Drift Detection Algorithm

Uses the **Kolmogorov-Smirnov (KS) Test** to detect distribution shifts:

- Compares baseline vs. current feature distributions
- p-value < 0.05 indicates significant drift
- Tracks accuracy degradation over time

---

## 🎨 UI Theme

Premium dark luxury theme with gold accents:

| Color | Hex | Usage |
|-------|-----|-------|
| Navy | `#050508` | Background |
| Charcoal | `#12121A` | Cards |
| Gold | `#D4AF37` | Primary accent |
| Gold Light | `#F4D03F` | Highlights |
| Teal | `#00D9B5` | Success states |
| Platinum | `#E5E4E2` | Text |

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Make sure virtual environment is activated
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Mac/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend won't connect to backend
```bash
# Check if backend is running
curl http://localhost:8000/

# Check Vite proxy configuration in vite.config.ts
```

### Port already in use
```bash
# Kill processes on ports 3000 and 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :8000
kill -9 <PID>
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 👥 Team

Built with ❤️ for the Hackathon

---

<div align="center">

**SentinelAI** - Making Deployed AI Accountable

</div>
