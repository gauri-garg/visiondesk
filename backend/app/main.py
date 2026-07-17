from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.db import Base, engine

from app.models.detection_model import Detection
from app.models.document_model import Document
from app.models.user_model import User

from app.api.upload import router as upload_router
from app.api.detection import router as detection_router
from app.api.report import router as report_router
from app.api.dashboard import router as dashboard_router
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router

from app.auth.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VisionDesk AI",
    version="1.0.0",
    description="AI-powered Workplace Safety Monitoring System",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/app",
    StaticFiles(directory="app"),
    name="app",
)

app.include_router(upload_router)
app.include_router(detection_router)
app.include_router(report_router)
app.include_router(dashboard_router)
app.include_router(chat_router)
app.include_router(documents_router)
app.include_router(auth_router)


@app.get("/")
async def root():

    return {
        "status": "running",
        "project": "VisionDesk AI",
    }


@app.get("/health")
async def health():

    return {
        "status": "healthy",
    }