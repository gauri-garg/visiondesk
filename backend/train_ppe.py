from ultralytics import YOLO
from pathlib import Path

# Dataset configuration
DATASET = Path(r"C:\Users\naras\VisionDeskAI\datasets\ppe_dataset\data.yaml")

# Load pretrained YOLO11 nano model
model = YOLO("yolo11n.pt")

# Train
model.train(
    data=str(DATASET),
    epochs=50,
    imgsz=640,
    batch=8,
    device="cpu",      # Change to 0 if you have an NVIDIA GPU with CUDA
    workers=2,
    project="visiondesk_training",
    name="ppe_model",
    pretrained=True,
    patience=15,
)

print("\n✅ Training Complete!")