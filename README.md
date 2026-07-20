# VisionDesk AI

**Multimodal Workplace Safety Intelligence System**

VisionDesk AI is an AI-powered workplace safety platform that combines computer vision, document intelligence, and retrieval-augmented generation to help safety officers monitor PPE compliance, search safety documentation, and generate compliance reports — all through a single unified dashboard.

Detect PPE violations from construction site images, upload safety manuals and inspection reports to build a searchable knowledge base, ask natural-language questions grounded in your own documents, and export professional PDF compliance reports.

---

## Features

**Computer Vision (Milestone 1)**
- YOLOv8-based PPE detection: helmets, safety vests, gloves, goggles, boots
- Per-worker violation detection with bounding boxes and confidence scores
- Safety score calculation and risk classification (Low / Medium / High)
- Gemini-powered AI recommendations and executive summaries
- Automatic PDF report generation with annotated images

**Document Intelligence (Milestone 2)**
- PDF upload with categorization (safety manual, incident report, inspection report, compliance document)
- Automated text extraction, cleaning, and semantic chunking
- Vector embeddings via Gemini `gemini-embedding-001`
- Persistent semantic search over all uploaded documents via ChromaDB
- Live processing status: `pending → processing → extracted → chunked → embedding → completed`

**RAG-Augmented Chat**
- Ask questions in natural language, get answers grounded in your actual documents
- Citations back to source filename and page number
- Automatic fallback to keyword-based logic when nothing matches

**Dashboard & Reporting**
- Real-time inspection statistics: workers, violations, compliance rate
- PPE compliance breakdown by category (helmet, vest, gloves, goggles, boots)
- Inspection timeline with historical trends
- Downloadable PDF reports with per-image detection results

**Authentication**
- JWT-based login/registration
- Protected routes for authenticated users
- User profile management

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, shadcn/ui, Framer Motion, Lucide Icons, Axios, React Router |
| **Backend** | FastAPI, SQLAlchemy 2, Uvicorn, Pydantic |
| **Vision** | YOLOv8 (Ultralytics), PyTorch, OpenCV, NumPy |
| **Documents** | PyMuPDF, LangChain (RecursiveCharacterTextSplitter) |
| **AI** | Gemini API (`gemini-2.0-flash` for chat, `gemini-embedding-001` for embeddings) |
| **Vector DB** | ChromaDB (persistent client, cosine similarity) |
| **Auth** | JWT + bcrypt + passlib |
| **Database** | SQLite (dev) — swap `DATABASE_URL` for PostgreSQL in prod |
| **PDF Generation** | ReportLab |

---

## Project Structure

```
visiondesk/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── gemini.py              # Gemini client for chat/reports
│   │   │   ├── rag.py                 # RAG context builder (M2)
│   │   │   ├── yolo.py                # YOLOv8 wrapper
│   │   │   └── models/
│   │   │       └── visiondesk_ppe.pt  # Trained PPE weights
│   │   ├── api/
│   │   │   ├── chat.py                # RAG-augmented chat endpoint
│   │   │   ├── dashboard.py           # Dashboard stats
│   │   │   ├── detection.py           # Detection endpoints
│   │   │   ├── documents.py           # Document CRUD + search (M2)
│   │   │   ├── report.py              # Report list + generate + delete
│   │   │   ├── upload.py              # Image upload
│   │   │   └── ...
│   │   ├── auth/                      # JWT authentication
│   │   ├── database/
│   │   │   └── db.py                  # SQLAlchemy setup
│   │   ├── models/
│   │   │   ├── detection_model.py     # Detection table
│   │   │   ├── document_model.py      # Document_Registry table (M2)
│   │   │   └── user_model.py          # Users table
│   │   ├── reports/
│   │   │   └── pdf_report.py          # ReportLab PDF generator
│   │   ├── services/
│   │   │   ├── chunker.py             # Text chunking (M2)
│   │   │   ├── compliance_service.py
│   │   │   ├── detection_service.py
│   │   │   ├── document_processor.py  # Pipeline orchestrator (M2)
│   │   │   ├── embedding_service.py   # Gemini embeddings (M2)
│   │   │   ├── pdf_extractor.py       # PyMuPDF extraction (M2)
│   │   │   ├── pose_service.py
│   │   │   ├── report_service.py
│   │   │   ├── retrieval_pipeline.py  # Semantic search (M2)
│   │   │   ├── text_cleaner.py        # Text normalization (M2)
│   │   │   └── vector_store.py        # ChromaDB wrapper (M2)
│   │   ├── uploads/                   # Uploaded images and PDFs (gitignored)
│   │   ├── generated_reports/         # Output PDFs (gitignored)
│   │   └── main.py                    # FastAPI app entry point
│   ├── chroma_db/                     # Vector store (gitignored)
│   ├── visiondesk.db                  # SQLite DB (gitignored)
│   ├── requirements.txt
│   └── .env                           # Secrets (gitignored)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/                # Navbar, Footer
    │   │   ├── dashboard/             # DashboardLayout, Sidebar, Topbar
    │   │   ├── detection/             # Detection results, PPE cards
    │   │   ├── landing/               # Hero, Stats, Features
    │   │   ├── chat/                  # FloatingChat, ChatMessage
    │   │   ├── auth/                  # ProtectedRoute
    │   │   └── ui/                    # shadcn components
    │   ├── pages/
    │   │   ├── Home.jsx               # Landing page
    │   │   ├── Login.jsx / Register.jsx / ForgotPassword.jsx
    │   │   ├── Dashboard.jsx          # Main dashboard
    │   │   ├── Detection.jsx          # Upload image → detect PPE
    │   │   ├── KnowledgeBase.jsx      # Upload docs → search (M2)
    │   │   ├── Chatbot.jsx            # AI assistant (RAG-augmented)
    │   │   ├── Analytics.jsx          # Charts and stats
    │   │   ├── Reports.jsx            # Generated PDF list
    │   │   └── Profile.jsx            # User profile
    │   ├── services/                  # axios API clients
    │   ├── App.jsx                    # Router
    │   ├── main.jsx                   # Entry point
    │   └── index.css                  # Tailwind + design tokens
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Prerequisites

- **Python 3.12+**
- **Node.js 20+** and **npm 10+**
- **Google Gemini API key** — get one at https://aistudio.google.com/apikey (free tier is enough for dev)
- **~2 GB free disk space** (mostly for PyTorch and YOLOv8 weights)

---

## Setup

### 1. Clone and prepare

```bash
git clone <your-repo-url> visiondesk
cd visiondesk
```

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate           # Linux/macOS
# venv\Scripts\activate            # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET_KEY=change-me-to-a-random-string
CHROMA_DB_PATH=./chroma_db
CHUNK_SIZE=800
CHUNK_OVERLAP=150
EMBEDDING_MODEL=gemini-embedding-001
EOF

# Start the server (auto-reload on changes)
uvicorn app.main:app --reload
```

Backend runs on **http://127.0.0.1:8000**.
API docs at **http://127.0.0.1:8000/docs**.

### 3. Frontend

In a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs on **http://localhost:5173** (falls back to 5174 if 5173 is busy — both are CORS-allowed).

### 4. First run

1. Open http://localhost:5173
2. Click **Register**, create an account
3. Upload an image on the **AI Detection** page → get PPE analysis
4. Upload a PDF on the **Knowledge Base** page → search it once processing completes
5. Ask questions in the **AI Assistant** chat — answers are grounded in your documents

---

## API Reference

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create user (email, password, full_name) |
| `POST` | `/api/auth/login` | Get JWT token |
| `GET` | `/api/auth/me` | Get current user (requires bearer token) |

### Detection

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/upload` | Upload image (multipart) |
| `POST` | `/api/detect` | Run YOLO detection on latest upload |
| `GET` | `/api/dashboard/summary` | Aggregate stats |

### Documents (Milestone 2)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/documents/upload` | Upload PDF + category → 202 with `document_id` |
| `GET` | `/api/documents?page=1&page_size=20` | Paginated list |
| `GET` | `/api/documents/{document_id}` | Get single document |
| `DELETE` | `/api/documents/{document_id}` | Delete document + vectors |
| `POST` | `/api/documents/search` | `{ query, top_k }` → `{ results, message? }` |

### Reports

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/report/generate` | Generate PDF for latest upload |
| `GET` | `/api/report/list` | List all PDFs with safety_score joined |
| `DELETE` | `/api/report/{report_id}` | Delete a PDF |

### Chat

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/chat` | `{ question }` → `{ answer, sources[] }` — RAG-augmented |

---

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | *(required)* | Gemini API access |
| `JWT_SECRET_KEY` | *(required)* | JWT signing secret |
| `CHROMA_DB_PATH` | `./chroma_db` | ChromaDB persistence directory |
| `CHUNK_SIZE` | `800` | Characters per document chunk |
| `CHUNK_OVERLAP` | `150` | Overlap between adjacent chunks |
| `EMBEDDING_MODEL` | `gemini-embedding-001` | Override if Google renames the model |
| `DATABASE_URL` | `sqlite:///./visiondesk.db` | SQLAlchemy connection string |

---

## Development

### Backend testing

Import-check every module:

```bash
cd backend
python -c "from app.main import app; print('OK')"
```

End-to-end pipeline smoke test (uses the `test_m2_e2e.py` script — needs a small text-native PDF):

```bash
pip install requests
python test_m2_e2e.py path/to/sample.pdf "safety helmet"
```

Expected output: 5 green checks (`upload → poll → search → delete → verify removal`).

### Frontend build

```bash
cd frontend
npm run build
```

Output in `dist/`. Preview with `npm run preview`.

### Adding new documents to the knowledge base

Only text-native PDFs work (scanned images need OCR, which isn't in the pipeline). Categories supported: `safety_manual`, `incident_report`, `inspection_report`, `compliance_document`. Max upload size: **50 MB**.

### Adding new PPE classes to YOLO detection

1. Retrain `visiondesk_ppe.pt` on your extended dataset
2. Update `PPE_CLASSES` in `app/services/detection_service.py`
3. Update the frontend PPE summary card icons in `components/detection/`

---

## Milestone Roadmap

- [x] **Milestone 1** — Visual Safety Detection (weeks 1–2)
  - PPE detection with YOLOv8 (helmet, vest, gloves, goggles, boots)
  - Image/video upload, violation detection, PDF report generation
- [x] **Milestone 2** — Document Intelligence & Knowledge Base (weeks 3–4)
  - PDF extraction, chunking, embedding, semantic search
  - RAG-augmented chat with citations
- [ ] **Milestone 3** — Multimodal RAG & Agentic Workflows (weeks 5–6)
  - Fuse detection results with document knowledge
  - LangGraph-based multi-step reasoning agent
- [ ] **Milestone 4** — Dashboard & Deployment (weeks 7–8)
  - Full analytics dashboard with historical trends
  - Docker deployment, cloud hosting

---

## License

Educational project — VisionDesk AI is developed as part of the Infosys team internship program.

---

## Credits
 Made by Gauri Garg(github.com/gauri-garg), Powered by YOLOv8 (Ultralytics), Google Gemini, LangChain, ChromaDB, and FastAPI.

For questions or issues, open an issue in this repository.