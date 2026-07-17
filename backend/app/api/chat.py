from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.detection_model import Detection
from app.ai.rag import rag_integration
from app.ai.gemini import gemini_service

router = APIRouter(
    prefix="/api",
    tags=["Chat"],
)


class ChatRequest(BaseModel):
    question: str


@router.post("/chat")
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
):

    latest = (
        db.query(Detection)
        .order_by(Detection.id.desc())
        .first()
    )

    if latest is None:

        return {

            "answer":
            "No inspection has been performed yet."

        }

    question = request.question.lower()

    workers = latest.workers

    helmets = latest.helmets

    vests = latest.vests

    gloves = latest.gloves

    goggles = latest.goggles

    boots = latest.boots

    violations = latest.violations

    score = latest.safety_score

    risk = latest.risk

    report = latest.ai_report

    # --- RAG layer ---
    try:
        context_chunks = rag_integration.retrieve_context(request.question)
    except Exception:
        context_chunks = []

    if context_chunks:
        detection_context = (
            f"Workers: {workers}, "
            f"Safety Score: {score}%, "
            f"Risk: {risk}, "
            f"Violations: {violations}"
        )
        prompt = rag_integration.build_rag_prompt(
            question=request.question,
            context_chunks=context_chunks,
            detection_context=detection_context,
        )
        ai_answer = gemini_service.ask(prompt)
        sources = [
            {"source_filename": ctx.source_filename, "page_number": ctx.page_number}
            for ctx in context_chunks
        ]
        return {"answer": ai_answer, "sources": sources}

    # --- Existing keyword-based fallback (unchanged) ---

    # -----------------------------

    if "worker" in question or "person" in question:

        return {

            "answer":
            f"The latest inspection detected {workers} workers."

        }

    if "helmet" in question:

        return {

            "answer":
            f"{helmets} workers are wearing helmets."

        }

    if "vest" in question:

        return {

            "answer":
            f"{vests} workers are wearing safety vests."

        }

    if "glove" in question:

        return {

            "answer":
            f"{gloves} workers are wearing gloves."

        }

    if "goggle" in question:

        return {

            "answer":
            f"{goggles} workers are wearing safety goggles."

        }

    if "boot" in question:

        return {

            "answer":
            f"{boots} workers are wearing safety boots."

        }

    if "score" in question:

        return {

            "answer":
            f"The latest safety score is {score}%."

        }

    if "risk" in question:

        return {

            "answer":
            f"The current workplace risk level is {risk}."

        }

    if "violation" in question:

        return {

            "answer":
            f"{violations} PPE violations were detected."

        }

    if "report" in question:

        return {

            "answer":
            report

        }

    if "safe" in question:

        if risk == "LOW":

            return {

                "answer":
                "The workplace is currently safe."

            }

        elif risk == "MEDIUM":

            return {

                "answer":
                "The workplace has a MEDIUM safety risk."

            }

        else:

            return {

                "answer":
                "The workplace has a HIGH safety risk. Immediate action is recommended."

            }

    return {

        "answer":
        "I can help you with workers, PPE, helmets, boots, gloves, goggles, safety score, violations, risk level and the latest inspection report."

    }
