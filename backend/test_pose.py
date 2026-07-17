from ultralytics import YOLO
import cv2
from pathlib import Path

model = YOLO("yolo11n-pose.pt")

image = r"app/uploads/WhatsApp Image 2026-07-03 at 11.38.14.jpeg"

results = model(image)

output_dir = Path("app/uploads/results")
output_dir.mkdir(exist_ok=True)

for result in results:

    print(f"People Detected: {len(result.keypoints)}")

    annotated = result.plot()

    output_file = output_dir / "pose_result.jpg"

    cv2.imwrite(str(output_file), annotated)

print("\nSaved to:")

print(output_file)