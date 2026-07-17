from ultralytics import YOLO

model = YOLO("app/ai/models/visiondesk_ppe.pt")

metrics = model.val()

print(metrics)