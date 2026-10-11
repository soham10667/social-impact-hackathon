# PrepPilot AI — Agentic Technical Interview & Placement Preparation Platform

Welcome to **PrepPilot AI**, an end-to-end AI-powered platform for technical interviews, placement preparation, coding, bug investigation, and production incident simulations.

## Project Structure

```text
preppilot-ai/
  ├── frontend/       # Next.js 14+ (App Router, TypeScript, Tailwind CSS, React Flow, Monaco Editor, Recharts)
  ├── backend/        # FastAPI Python Backend (LangGraph Multi-Agent Systems, Gemini LLM, Supabase PostgreSQL)
  ├── docs/           # DB schemas, architecture diagrams, API specs
  └── .env.example    # Environment variable references
```

## Quick Setup Instructions

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & pip
- Supabase Project (Cloud PostgreSQL, Auth, Storage)
- Gemini API Key

### 1. Environment Setup
Copy `.env.example` to `.env` in both `frontend/` and `backend/` and populate the required API keys.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with PrepPilot AI!
