Tech Stack
LayerTechnologyFrontendReact 19, Vite 8, Tailwind CSS v4, shadcn/ui, Framer Motion, Lucide Icons, Axios, React RouterBackendFastAPI, SQLAlchemy 2, Uvicorn, PydanticVisionYOLOv8 (Ultralytics), PyTorch, OpenCV, NumPyDocumentsPyMuPDF, LangChain (RecursiveCharacterTextSplitter)AIGemini API (gemini-2.0-flash for chat, gemini-embedding-001 for embeddings)Vector DBChromaDB (persistent client, cosine similarity)AuthJWT + bcrypt + passlibDatabaseSQLite (dev) — swap DATABASE_URL for PostgreSQL in prodPDF GenerationReportLab

git clone <https://github.com/gauri-garg/visiondesk.git> visiondesk
cd visiondesk

<!-- backend -->
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

Backend runs on http://127.0.0.1:8000.
API docs at http://127.0.0.1:8000/docs.
<!-- frontend -->
3. Frontend
In a new terminal:

cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev

Frontend runs on http://localhost:5173 (falls back to 5174 if 5173 is busy — both are CORS-allowed).
4. First run

Open http://localhost:5173
Click Register, create an account
Upload an image on the AI Detection page → get PPE analysis
Upload a PDF on the Knowledge Base page → search it once processing completes
Ask questions in the AI Assistant chat — answers are grounded in your documents