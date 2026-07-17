from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.detection_model import Detection

from app.services.detection_service import detection_service
from app.services.report_service import report_service

# Optional Gemini enhancement
try:
    from app.ai.gemini import gemini_service
    GEMINI_AVAILABLE = True
except Exception:
    GEMINI_AVAILABLE = False

router = APIRouter(
    prefix="/api/detect",
    tags=["Detection"],
)


@router.post("/latest")
async def detect_latest(
    db: Session = Depends(get_db),
):

    uploads = Path("app/uploads")

    files = [
        f for f in uploads.iterdir()
        if f.is_file()
    ]

    if not files:

        return {
            "success": False,
            "message": "No uploaded image found.",
        }

    latest = max(
        files,
        key=lambda f: f.stat().st_mtime,
    )

    # -----------------------------
    # Run YOLO Detection
    # -----------------------------

    result = detection_service.detect(
        str(latest)
    )

    # -----------------------------
    # VisionDesk Local AI Report
    # -----------------------------

    ai_report = report_service.generate(
        workers=result["workers_count"],
        stats=result["stats"],
        missing=result["missing"],
        score=result["safety_score"],
        risk=result["risk"],
    )

    # -----------------------------
    # Optional Gemini Enhancement
    # -----------------------------

    if GEMINI_AVAILABLE:

        try:

            gemini_report = gemini_service.generate_report(
                workers=result["workers_count"],
                stats=result["stats"],
                missing=result["missing"],
                score=result["safety_score"],
                risk=result["risk"],
            )

            if (
                gemini_report
                and "Gemini Error" not in gemini_report
                and "quota" not in gemini_report.lower()
            ):

                ai_report = gemini_report

        except Exception:

            pass

    # -----------------------------
    # Save Detection
    # -----------------------------

    detection = Detection(

        filename=latest.name,

        workers=result["workers_count"],

        helmets=result["stats"]["helmet"],

        vests=result["stats"]["vest"],

        gloves=result["stats"]["gloves"],

        goggles=result["stats"]["goggles"],

        boots=result["stats"]["boots"],

        violations=result["violations"],

        safety_score=result["safety_score"],

        risk=result["risk"],

        ai_report=ai_report,

        pdf_path="",

    )

    db.add(detection)

    db.commit()

    db.refresh(detection)

    return {

        "success": True,

        "filename": latest.name,

        **result,

        "ai_report": ai_report,

    }