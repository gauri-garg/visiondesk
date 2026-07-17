from pathlib import Path
from ultralytics import YOLO

from app.services.compliance_service import compliance_service

MODEL_PATH = "app/ai/models/visiondesk_ppe.pt"

model = YOLO(MODEL_PATH)

CONFIDENCE_THRESHOLD = 0.25


class DetectionService:

    def detect(self, image_path: str):

        results = model(image_path)

        output_dir = Path("app/uploads/results")
        output_dir.mkdir(parents=True, exist_ok=True)

        annotated_path = output_dir / Path(image_path).name

        detections = []

        for result in results:

            result.save(filename=str(annotated_path))

            for box in result.boxes:

                conf = float(box.conf[0])

                if conf < CONFIDENCE_THRESHOLD:
                    continue

                cls = int(box.cls[0])

                label = model.names[cls]

                if label == "none":
                    continue

                detections.append(
                    {
                        "label": label,
                        "confidence": round(conf, 3),
                        "bbox": [float(x) for x in box.xyxy[0]],
                    }
                )

        workers = compliance_service.analyse(detections)

        summary = {
            "Person": len(workers),
            "helmet": 0,
            "vest": 0,
            "gloves": 0,
            "goggles": 0,
            "boots": 0,
        }

        for worker in workers:

            if worker["helmet"]:
                summary["helmet"] += 1

            if worker["vest"]:
                summary["vest"] += 1

            if worker["gloves"]:
                summary["gloves"] += 1

            if worker["goggles"]:
                summary["goggles"] += 1

            if worker["boots"]:
                summary["boots"] += 1

        missing = {
            "helmet": 0,
            "vest": 0,
            "gloves": 0,
            "goggles": 0,
            "boots": 0,
        }

        score_sum = 0

        for worker in workers:

            worker_score = 0

            for item in [
                "helmet",
                "vest",
                "gloves",
                "goggles",
                "boots",
            ]:

                if worker[item]:
                    worker_score += 1
                else:
                    missing[item] += 1

            score_sum += worker_score

        if len(workers) == 0:

            safety_score = 100

        else:

            safety_score = round(
                score_sum / (len(workers) * 5) * 100
            )

        violations = sum(missing.values())

        if safety_score >= 90:
            risk = "LOW"
        elif safety_score >= 70:
            risk = "MEDIUM"
        else:
            risk = "HIGH"

        return {

            "detections": detections,

            "workers": workers,

            "stats": summary,

            "missing": missing,

            "violations": violations,

            "workers_count": len(workers),

            "safety_score": safety_score,

            "risk": risk,

            "annotated_image": str(annotated_path).replace("\\", "/"),

        }


detection_service = DetectionService()