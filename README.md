# Attendora: Enterprise Multi-Tenant Academic Operating System

Attendora is an institutional attendance governance platform and academic operating system designed for higher education institutions, statutory compliance (UGC 75% rule), dynamic TOTP anti-proxy attendance verification, and multi-tenant row-level security.

---

## 📁 Project Architecture & Folder Structure

The repository is organized into completely separated `frontend/` and `backend/` subfolders with independent dependencies and configurations:

```text
Attendora/
├── frontend/                     # React 19 Client Application
│   ├── public/                   # Static assets, PWA manifest, service worker
│   ├── src/
│   │   ├── api/                  # HTTP API client (communicates via REST fetch)
│   │   ├── components/           # UI components (Desktop, Mobile PWA, Showcase)
│   │   ├── data/                 # Client offline mock & baseline seed data
│   │   ├── types/                # Frontend TypeScript type declarations
│   │   ├── utils/                # QR verification, LTI 1.3, statutory rules
│   │   ├── App.tsx               # Root React application component
│   │   ├── index.css             # Tailwind CSS v4 design tokens
│   │   └── main.tsx              # DOM mounting entry point
│   ├── index.html                # Vite HTML template
│   ├── metadata.json             # App manifest metadata
│   ├── vite.config.ts            # Vite bundler configuration
│   ├── tsconfig.json             # TypeScript client configuration
│   ├── package.json              # Frontend dependencies
│   ├── .env.example              # Frontend environment template
│   └── .env                      # Local frontend environment variables
│
├── backend/                      # Monolith Backend Engine
│   ├── migrations/               # PostgreSQL schema & Row-Level Security migrations
│   ├── routes/                   # Python Flask REST blueprints (Auth, Academic, Audit)
│   ├── src/                      # Express TypeScript companion backend
│   │   ├── data/                 # In-memory database simulation
│   │   ├── types/                # Backend TypeScript interfaces
│   │   └── index.ts              # Express API server
│   ├── app.py                    # Flask application factory
│   ├── auth.py                   # HMAC-SHA256 / JWT auth utilities
│   ├── config.py                 # Backend environment & database configuration
│   ├── requirements.txt          # Python pip dependencies
│   ├── package.json              # Node.js backend dependencies
│   ├── tsconfig.json             # TypeScript backend configuration
│   ├── .env.example              # Backend environment template
│   └── .env                      # Local backend environment variables
│
├── tests/                        # Backend integration & statutory compliance tests
├── package.json                  # Root monorepo workspace orchestration scripts
├── decisions.md                  # Architectural Decision Records (ADRs)
├── rules.md                      # Development and coding standards
├── memory.md                     # Long-term persistent project context
├── changelog.md                  # Chronological change ledger
├── phases.md                     # Product phase specifications
└── README.md                     # Project documentation & execution guide
```

---

## ⚙️ Environment Variables

The frontend and backend use strictly separated environment files:

### Frontend (`frontend/.env`)
```bash
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api/v1

# Institutional Configuration
VITE_APP_TITLE=Attendora Academic Operating System
VITE_DEFAULT_TENANT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Backend (`backend/.env`)
```bash
# API Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Security & Tokens
JWT_SECRET=attendora-jwt-secure-signing-key-minimum-256-bit
JWT_ACCESS_MINUTES=15
JWT_REFRESH_DAYS=7

# Persistence & Data Isolation
DATABASE_URL=postgresql://attendora_user:attendora_pass@localhost:5432/attendora_db
REDIS_URL=redis://localhost:6379/0

# UGC Compliance Thresholds
DEFAULT_STATUTORY_THRESHOLD=75.0
DEFAULT_WARNING_THRESHOLD=70.0
```

---

## 🚀 Setup & Execution Guide

### 1. Installing Dependencies

#### A. Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### B. Install Backend Dependencies
- **Node.js Express Companion Server:**
  ```bash
  cd backend
  npm install
  ```
- **Python Flask API Server:**
  ```bash
  cd backend
  pip install -r requirements.txt
  ```

#### C. Root One-Step Installation
From the project root:
```bash
npm run install:all
```

---

### 2. Starting the Backend Server

You can run either the **Python Flask** backend engine or the **Node/Express** companion server on port `5000`:

#### Option A: Python Flask Monolith (Recommended for Cloud & PostgreSQL)
```bash
# From repository root:
npm run dev:backend:flask

# Or directly:
cd backend
python app.py
```

#### Option B: Express TypeScript Server
```bash
# From repository root:
npm run dev:backend

# Or directly:
cd backend
npm run dev
```

Both backends expose identical endpoints:
- `GET /api/health` — Service health telemetry and compliance engine status.
- `POST /api/v1/auth/login` — Institutional credentials authentication.
- `GET /api/v1/students` — Tenant-isolated student roster.
- `POST /api/v1/attendance/sessions` — Cryptographically verified roll-call submission.
- `GET /api/v1/reports/defaulters` — UGC 75% statutory shortfall analysis.
- `GET /api/v1/audit/logs` — Immutable non-repudiation audit ledger.

---

### 3. Starting the Frontend Application

```bash
# From repository root:
npm run dev:frontend

# Or directly from frontend/:
cd frontend
npm run dev
```

Open your browser at **`http://localhost:3000`** to access the Attendora suite (Desktop Console, Student Mobile PWA, and Showcase view).

---

### 4. Running Both Simultaneously

To start both servers in development mode:
- **Terminal 1 (Backend):**
  ```bash
  npm run dev:backend:flask
  ```
- **Terminal 2 (Frontend):**
  ```bash
  npm run dev:frontend
  ```

---

### 5. Running Automated Verification Suites

Both suites can be executed independently:

```bash
# Run 26 frontend utility, API client, and offline storage tests
npm run test:frontend

# Run 15 backend statutory compliance, RLS, and auth tests
npm run test:backend

# Run the complete test suite (41 tests)
npm test
```

---

## 🔒 Security & Architecture Principles

1. **Clean Decoupling:** The frontend communicates strictly via HTTP/REST fetch calls (`frontend/src/api/client.ts`). Frontend components never import backend models or server implementations directly.
2. **Multi-Tenant Row-Level Security:** Every request propagates `X-Tenant-ID` and Bearer JWT tokens to ensure strict institutional data boundary isolation.
3. **Statutory Gating:** Exam clearance, medical waivers, and hall-ticket gating are evaluated according to UGC guidelines ($\ge 75.0\%$ threshold).

