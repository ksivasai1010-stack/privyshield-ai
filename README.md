# PrivyShield AI 🛡️
### *Intelligent AI Privacy Firewall & Security Platform*

> **"Before your private information reaches AI, PrivyShield protects it."**

---

## 1. Project Overview & Problem Statement

### The Problem
As developers, enterprises, and individual users increasingly adopt Generative AI models (ChatGPT, Claude, Gemini, Grok, Copilot), confidential data is routinely leaked into model prompts:
- Developers paste database connection strings, API keys (`sk-*`, AWS keys), and private SSH keys to debug code.
- Employees paste KYC documents, Aadhaar cards, PAN details, bank account numbers, and credit cards.
- Enterprises paste internal M&A memos, trade secrets, and NDA-restricted financial metrics.

Once submitted to external AI APIs, this information can be stored in vendor chat histories, exposed to logging pipelines, or ingested into training corpora.

### The Solution: PrivyShield AI
**PrivyShield AI** is an intelligent, zero-leakage security firewall positioned between the user and external AI endpoints. It:
1. **Intercepts raw user prompts locally** over encrypted HTTPS.
2. **Scans for sensitive patterns** across credentials, Indian PII, and financial identifiers.
3. **Redacts sensitive data** using numbered semantic placeholders (e.g., `[EMAIL_1]`, `[API_KEY_1]`, `[CARD_NUMBER_1]`).
4. **Calculates a transparent Privacy Risk Score** (0–100) and severity rating (Safe, Low, Medium, High, Critical).
5. **Executes Dual AI Consensus** via **Google Gemini 1.5** and **xAI Grok** using **only sanitized text** to audit contextual exposure and prompt resistance.
6. **Requires explicit user consent** before any sanitized prompt is dispatched to an AI provider.
7. **Maintains cryptographic audit logs** (SHA-256 hashes only) in **Supabase PostgreSQL** protected by Row Level Security (RLS). **Original prompts are permanently discarded from memory and never stored.**

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v7, Tailwind CSS, Lucide React, Recharts, Axios, React Hot Toast |
| **Backend** | Node.js (ESM), Express.js, JWT, bcryptjs, Zod, Helmet, Express Rate Limit, CORS |
| **Database** | Supabase PostgreSQL with Row Level Security (RLS) & Parameterized SQL |
| **AI Providers** | Google Gemini 1.5 Flash (`@google/genai` / REST) & xAI Grok (`grok-2-latest`) |

---

## 3. High-Level Architecture & Data Flow

```mermaid
flowchart TD
    User([User / Developer Prompt]) -->|HTTPS| Firewall[PrivyShield AI Gateway]
    
    subgraph Core Security Engine (Local)
        Firewall --> Scanner[Deterministic Entity Scanner]
        Scanner -->|Matches API Keys, Passwords, Luhn Check, Indian PII| Redactor[Numbered Placeholder Redaction Engine]
        Redactor --> Scrubber[Memory Scrubber: Purge Raw Prompt]
        Redactor --> Hasher[Compute SHA-256 Hash of Sanitized Text]
    end
    
    subgraph Dual AI Consensus
        Redactor -->|Sanitized Prompt ONLY| Gemini[Google Gemini 1.5 Flash]
        Redactor -->|Sanitized Prompt ONLY| Grok[xAI Grok Beta]
        Gemini --> Consensus[Consensus Synthesizer]
        Grok --> Consensus
    end
    
    subgraph Persistence & Audit
        Hasher --> DB[(Supabase PostgreSQL with RLS)]
        Consensus --> DB
        note[Safe Metadata Only: Risk Score, Categories, Hashes]
    end
    
    Consensus --> UI[Dashboard & Interactive Review]
    UI -->|Explicit User Approval| ExternalAI([External AI Endpoint])
```

---

## 4. Repository Structure

```
privyshield-ai/
├── backend/
│   ├── config/
│   │   └── supabase.js             # Supabase client with safe masking & fallback
│   ├── controllers/
│   │   ├── authController.js       # Register, Login, Me with bcrypt & JWT
│   │   ├── scannerController.js    # Scan, Redact, Consensus, History & Stats
│   │   ├── aiController.js         # Direct Gemini & Grok service calls
│   │   └── settingsController.js   # User profiles & privacy policies
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT bearer validation
│   │   └── rateLimiter.js          # Express rate limiting
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── scannerRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── healthRoutes.js         # Live diagnostic & integration verification
│   ├── services/
│   │   ├── securityScanner.js      # 15+ regex patterns + Luhn card validator
│   │   ├── redactionService.js     # Numbered placeholder tokenization & SHA-256
│   │   ├── geminiService.js        # Google Gemini contextual evaluation
│   │   ├── grokService.js          # xAI Grok prompt injection & secondary check
│   │   ├── consensusService.js     # Multi-provider consensus matrix
│   │   └── storageService.js       # Supabase CRUD with resilient fallback
│   ├── server.js                   # Express server entry point
│   ├── package.json
│   ├── .env.example
│   └── .env (git-ignored)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Live firewall status & judge demo button
│   │   │   ├── Footer.jsx          # Architecture & security guarantees
│   │   │   ├── RiskMeter.jsx       # Animated circular gauge (0-100)
│   │   │   ├── StatCard.jsx        # Glassmorphism telemetry metrics
│   │   │   ├── ThreatBadge.jsx     # Severity badges with icons
│   │   │   ├── PromptComparison.jsx# Raw vs Sanitized view with copy & consent
│   │   │   └── ConsensusCard.jsx   # Gemini vs Grok agreement matrix
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # Hero, live preview scanner, features
│   │   │   ├── LoginPage.jsx       # Auth with Instant Judge Demo mode
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx   # Recharts risk distributions & recent activity
│   │   │   ├── ScannerPage.jsx     # Core interactive prompt firewall
│   │   │   ├── ThreatAnalysisPage.jsx # Threat engine catalog & sandbox
│   │   │   ├── AiAnalysisPage.jsx  # Multi-model consensus telemetry
│   │   │   ├── HistoryPage.jsx     # Cryptographic audit hash ledger
│   │   │   └── SettingsPage.jsx    # Privacy policies & AI preferences
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Session & demo analyst management
│   │   ├── services/
│   │   │   └── api.js              # Axios with JWT bearer injection
│   │   ├── utils/
│   │   │   └── demoPrompts.js      # Preloaded test cases (Rahul demo, etc.)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Glassmorphism styling & cyber grid
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── .env.example
│   └── .env (git-ignored)
├── database/
│   └── schema.sql                  # Supabase PostgreSQL tables & RLS policies
├── .gitignore                      # Strict secret isolation
└── README.md
```

---

## 5. Installation & Setup

### Prerequisites
- **Node.js**: v18.x or later (tested on v26.x)
- **npm**: v9.x or later

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd hackathon
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 6. Environment Configuration

### Backend Environment (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and populate your credentials:

```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here

# Supabase Credentials (from Supabase Dashboard -> Settings -> API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_PASSWORD=your-database-password

# AI Provider Credentials
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
GROK_API_KEY=your_xai_grok_api_key

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:5000/api
```

### Frontend Environment (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

> **Security Note:** Secrets like `GEMINI_API_KEY`, `GROK_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are strictly backend-only and are never bundled into client JavaScript.

---

## 7. Supabase Database Setup

1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**.
3. Open `database/schema.sql` from this repository and run the script.
4. The schema creates:
   - `profiles`: User accounts and preferred AI configuration.
   - `scan_history`: Safe scan telemetry (Risk Score, Level, Categories, SHA-256 Hash).
   - `security_events`: Audit logs of intercepted threats and logins.
   - **Row Level Security (RLS)** policies on all tables so users can only access their own records.

---

## 8. Running the Application Locally

### Start Backend
In terminal 1:
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
# Diagnostic check: http://localhost:5000/api/health
```

### Start Frontend
In terminal 2:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 9. Hackathon Judge Demonstration Walkthrough

1. **Instant Access**: Click the **"Demo Mode"** button in the Navbar or on the Login screen to log in immediately as a pre-configured Security Analyst.
2. **Test Case 1 (Official Rahul Demo Prompt)**:
   - Go to **Scanner**.
   - Select the preloaded test case: **"Hackathon Official Demo (Rahul)"**:
     ```
     My name is Rahul. My email is rahul@example.com. I accidentally included a sample API key sk-example-123456. Help me debug my application.
     ```
   - Click **"Scan & Redact Prompt"**.
   - **Result**:
     - Status: `Critical Risk (85/100)`.
     - Entities intercepted: Email Address + OpenAI format API key.
     - Sanitized output:
       `My name is Rahul. My email is [EMAIL_1]. I accidentally included a sample API key [API_KEY_1]. Help me debug my application.`
     - Review the **AI Consensus Card** showing Multi-Model verification.
3. **Test Case 2 (Indian PII & Financial)**:
   - Select **"Indian National PII Leak"** or **"Payment Card & Banking IFSC"**.
   - See how 12-digit Aadhaar patterns, PAN tax cards, Luhn-validated credit cards, and IFSC codes are cleanly replaced with semantic placeholders.
4. **Test Case 3 (Zero Egress AI Consent)**:
   - Click **"Send to AI with Consent"**. Notice the explicit confirmation modal. Original raw text is never dispatched.
5. **Dashboard & History**:
   - Navigate to **Dashboard** to view live Recharts telemetry.
   - Navigate to **Audit History** to verify that only cryptographic SHA-256 hashes and risk metadata are persisted.

---

## 10. Production Deployment Guide

### Frontend Deployment (Vercel)
1. Import `frontend/` directory to Vercel.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

### Backend Deployment (Render)
1. Create a Web Service pointing to `backend/`.
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Add Environment Variables: `PORT=5000`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GROK_API_KEY`, `JWT_SECRET`, `FRONTEND_URL`.

---

## 11. Security Best Practices Summary
- **Zero-Log Architecture**: Raw prompt text exists in memory only during inspection and is scrubbed immediately after placeholder replacement.
- **Fail-Safe Fallback**: If an external AI provider (Gemini or Grok) is offline or missing a key, the deterministic local security engine handles 100% of the detection and redaction without breaking.
- **Cryptographic Hashing**: Only SHA-256 hashes of sanitized prompts are stored for audit verification.
- **Strict Git Isolation**: Wildcard `.env*` rules prevent accidental secret exposure.
