from ultralytics import YOLO

# First run automatically downloads yolo11n.pt
model = YOLO("yolo11n.pt")

def detect_objects(image_path):
    results = model(image_path)

    detections = []

    for result in results:
        for box in result.boxes:

            cls = int(box.cls[0])

            conf = float(box.conf[0])

            detections.append({
                "class": model.names[cls],
                "confidence": round(conf,3)
            })

    return detections