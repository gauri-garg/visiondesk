# VisionDesk AI

**Multimodal Workplace Intelligence System**

VisionDesk AI is a FastAPI-powered backend that combines real-time PPE (Personal Protective Equipment) detection with a document intelligence knowledge base. It lets safety teams upload construction-site images for instant compliance analysis, build a searchable knowledge base from safety PDFs, and query an AI chat assistant that draws on both live detections and indexed documents.

---

## Features

### Milestone 1 — PPE Detection (Complete)
- Upload workplace images and run YOLOv8-based PPE detection
- Detect helmets, vests, gloves, boots, and other safety gear
- Generate PDF compliance reports per inspection
- Dashboard statistics for detection history

### Milestone 2 — Document Intelligence & Knowledge Base (In Progress)
- Upload safety PDFs and extract text with PyMuPDF
- Chunk and embed documents into a ChromaDB vector store
- Semantic search across the knowledge base
- RAG-powered chat assistant that cites source documents

---

## Tech Stack

| Layer | Technology |
|---|---|
| API framework | FastAPI |
| Database | SQLAlchemy + SQLite (`visiondesk.db`) |
| Object detection | YOLOv8 (Ultralytics) |
| PDF extraction | PyMuPDF (fitz) |
| Text splitting | LangChain Text Splitters |
| Vector store | ChromaDB |
| AI / embeddings | Google Gemini AI (`google-generativeai`) |

---

## Prerequisites

- Python 3.10 or higher
- `pip`
- A virtual environment tool (built-in `venv` is fine)
- A Google Gemini API key (required for chat and embeddings)

---

## Installation

```bash
git clone <repo-url>
cd backend

python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file in the project root. The application loads it automatically on startup.

```dotenv
# Required
GEMINI_API_KEY=            # Google Gemini API key

# Optional — defaults shown
CHROMA_DB_PATH=./chroma_db # ChromaDB persistence directory
CHUNK_SIZE=800             # Text chunk size in characters
CHUNK_OVERLAP=150          # Chunk overlap in characters
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key for chat and text embeddings |
| `CHROMA_DB_PATH` | No | `./chroma_db` | Directory where ChromaDB persists vector data |
| `CHUNK_SIZE` | No | `800` | Maximum characters per document chunk |
| `CHUNK_OVERLAP` | No | `150` | Overlap between consecutive chunks (must be < `CHUNK_SIZE`) |

---

## Running the Server

```bash
uvicorn app.main:app --reload
```

| URL | Purpose |
|---|---|
| `http://127.0.0.1:8000` | API root (`{"status": "running"}`) |
| `http://127.0.0.1:8000/docs` | Interactive Swagger UI |
| `http://127.0.0.1:8000/redoc` | ReDoc API reference |
| `http://127.0.0.1:8000/health` | Health check |

---

## API Endpoints

### PPE Detection

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload/` | Upload a workplace image for PPE detection |
| `POST` | `/api/detect/latest` | Run detection on the most recently uploaded image |
| `GET` | `/api/dashboard/summary` | Retrieve detection statistics for the dashboard |
| `GET` | `/api/report/{id}` | Download a PDF compliance report for a detection |

### Document Knowledge Base

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/documents/upload` | Upload a safety PDF (≤ 50 MB); processing runs in the background |
| `GET` | `/api/documents` | List all documents in the knowledge base (paginated) |
| `GET` | `/api/documents/{id}` | Get status and metadata for a specific document |
| `DELETE` | `/api/documents/{id}` | Delete a document and remove its vectors from ChromaDB |
| `POST` | `/api/documents/search` | Semantic search across indexed documents |

### Chat Assistant

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat` | Ask the AI assistant a question; returns an answer with optional source citations |

### Authentication

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Obtain an access token |

---

## Project Structure

```
backend/
├── app/
│   ├── ai/
│   │   ├── gemini.py           # Gemini AI client and chat service
│   │   ├── rag.py              # RAG integration (context retrieval + prompt building)
│   │   ├── yolo.py             # YOLOv8 inference wrapper
│   │   └── models/
│   │       └── visiondesk_ppe.pt   # Fine-tuned PPE detection model
│   ├── api/
│   │   ├── chat.py             # Chat endpoint (keyword + RAG hybrid)
│   │   ├── dashboard.py        # Dashboard statistics endpoint
│   │   ├── detection.py        # Detection trigger endpoint
│   │   ├── documents.py        # Document upload, list, search, delete endpoints
│   │   ├── report.py           # PDF report generation endpoint
│   │   └── upload.py           # Image upload endpoint
│   ├── auth/
│   │   ├── auth.py             # Auth router (register / login)
│   │   ├── schemas.py          # Auth Pydantic schemas
│   │   └── security.py         # Password hashing and JWT utilities
│   ├── database/
│   │   └── db.py               # SQLAlchemy engine, session, and Base
│   ├── models/
│   │   ├── detection_model.py  # Detection ORM model
│   │   ├── document_model.py   # Document ORM model (Document_Registry table)
│   │   └── user_model.py       # User ORM model
│   ├── reports/
│   │   └── pdf_report.py       # PDF report builder (ReportLab)
│   ├── services/
│   │   ├── chunker.py          # Text chunking service (RecursiveCharacterTextSplitter)
│   │   ├── compliance_service.py   # Compliance rule evaluation
│   │   ├── detection_service.py    # Detection orchestration
│   │   ├── document_processor.py   # End-to-end document processing pipeline
│   │   ├── embedding_service.py    # Gemini embedding generation with retry logic
│   │   ├── pdf_extractor.py        # PyMuPDF text extraction
│   │   ├── report_service.py       # Report data aggregation
│   │   ├── retrieval_pipeline.py   # Query embedding + vector search pipeline
│   │   ├── text_cleaner.py         # Text normalisation and deduplication
│   │   └── vector_store.py         # ChromaDB wrapper (upsert, search, delete)
│   ├── uploads/                # Uploaded images and result overlays
│   ├── generated_reports/      # Generated PDF compliance reports
│   └── main.py                 # FastAPI app factory, middleware, router registration
├── requirements.txt            # Pinned Python dependencies
├── .env                        # Local environment variables (not committed)
├── .gitignore
└── README.md
```

---

## Document Processing Pipeline

When a PDF is uploaded via `POST /api/documents/upload`, the following pipeline runs asynchronously in the background:

```
Upload → Extract text (PyMuPDF)
       → Clean text (null bytes, control chars, blank lines, duplicates)
       → Chunk text (RecursiveCharacterTextSplitter)
       → Generate embeddings (Gemini text-embedding-004)
       → Upsert vectors (ChromaDB)
       → status: "completed"
```

Poll `GET /api/documents/{id}` to track progress. Possible status values: `pending`, `extracted`, `chunked`, `embedding`, `completed`, `failed`.

---

## Development Notes

- The SQLite database file (`visiondesk.db`) is created automatically on first run.
- ChromaDB data is stored in `./chroma_db/` by default; set `CHROMA_DB_PATH` to change this.
- All ChromaDB operations are synchronous — they are wrapped with `run_in_threadpool` inside async route handlers.
- The document background task uses a dedicated `SessionLocal()` session, separate from the request session.
- Existing keyword-based chat logic is preserved; RAG is an additive layer that only activates when relevant document chunks are found.
