from pathlib import Path
from fastapi import APIRouter
from datetime import datetime
from app.ai.gemini import gemini_service
from app.reports.pdf_report import pdf_report
from app.services.detection_service import detection_service
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.detection_model import Detection

router = APIRouter(
    prefix="/api/report",
    tags=["Report"],
)


@router.post("/generate")
async def generate_report():

    uploads = Path("app/uploads")

    files = [f for f in uploads.iterdir() if f.is_file()]

    if not files:
        return {
            "success": False,
            "message": "No uploaded image found."
        }

    latest = max(
        files,
        key=lambda f: f.stat().st_mtime
    )

    result = detection_service.detect(str(latest))

    ai_report = gemini_service.generate_report(
        workers=result["workers_count"],
        stats=result["stats"],
        missing=result["missing"],
        score=result["safety_score"],
        risk=result["risk"],
    )

    pdf_path = pdf_report.generate(
        filename=latest.name,
        original_image=str(latest),
        annotated_image=result["annotated_image"],
        stats=result["stats"],
        violations=result["violations"],
        score=result["safety_score"],
        risk=result["risk"],
        ai_report=ai_report,
    )

    return {
        "success": True,
        "pdf": pdf_path,
    }


@router.get("/list")
def list_reports(db: Session = Depends(get_db)):
    """List every PDF in app/generated_reports/, enriched with detection data."""
    reports_dir = Path("app/generated_reports")
    if not reports_dir.exists():
        return {"reports": []}

    # Build a lookup: image_stem -> latest Detection row
    detections = db.query(Detection).order_by(Detection.id.desc()).all()
    by_stem = {}
    for d in detections:
        if d.filename:
            stem = Path(d.filename).stem
            by_stem.setdefault(stem, d)  # keep newest (first hit wins)

    items = []
    for pdf in reports_dir.glob("*.pdf"):
        stat = pdf.stat()
        # PDF is saved as <image_stem>_report.pdf → strip suffix to look up
        image_stem = pdf.stem.removesuffix("_report")
        detection = by_stem.get(image_stem)
        items.append({
            "id": pdf.stem,
            "filename": pdf.name,
            "pdf_path": f"app/generated_reports/{pdf.name}",
            "created_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "size_bytes": stat.st_size,
            "safety_score": detection.safety_score if detection else None,
            "risk": detection.risk if detection else None,
            "workers": detection.workers if detection else None,
            "violations": detection.violations if detection else None,
        })

    items.sort(key=lambda r: r["created_at"], reverse=True)
    return {"reports": items}


@router.delete("/{report_id}")
def delete_report(report_id: str):
    """Delete a report PDF by its ID (filename without .pdf)."""
    pdf = Path("app/generated_reports") / f"{report_id}.pdf"
    if not pdf.exists():
        raise HTTPException(status_code=404, detail="Report not found.")
    pdf.unlink()
    return {"success": True, "message": "Report deleted."}