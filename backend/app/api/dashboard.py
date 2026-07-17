from pathlib import Path

from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.db import get_db

from app.models.detection_model import Detection

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/summary")
async def dashboard_summary(

    db: Session = Depends(get_db),

):

    latest = (

        db.query(Detection)

        .order_by(desc(Detection.id))

        .first()

    )

    reports = Path("app/generated_reports")

    reports.mkdir(exist_ok=True)

    report_files = sorted(

        reports.glob("*.pdf"),

        key=lambda x: x.stat().st_mtime,

        reverse=True,

    )

    recent_reports = []

    for pdf in report_files[:10]:

        recent_reports.append({

            "name": pdf.name,

            "path": f"/app/generated_reports/{pdf.name}",

        })

    if latest is None:

        return {

            "workers": 0,

            "violations": 0,

            "safety_score": 0,

            "reports": 0,

            "risk": "LOW",

            "filename": "",

            "latest_image": "",

            "latest_result": "",

            "stats": {

                "helmet": 0,

                "vest": 0,

                "gloves": 0,

                "goggles": 0,

                "boots": 0,

                "Person": 0,

            },

            "recent_reports": [],

        }

    return {

        "workers": latest.workers,

        "violations": latest.violations,

        "safety_score": latest.safety_score,

        "reports": len(report_files),

        "risk": latest.risk,

        "filename": latest.filename,

        "latest_image": f"/app/uploads/{latest.filename}",

        "latest_result": f"/app/uploads/results/{latest.filename}",

        "stats": {

            "Person": latest.workers,

            "helmet": latest.helmets,

            "vest": latest.vests,

            "gloves": latest.gloves,

            "goggles": latest.goggles,

            "boots": latest.boots,

        },

        "recent_reports": recent_reports,

        "ai_report": latest.ai_report,

    }