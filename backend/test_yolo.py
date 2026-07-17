from ultralytics import YOLO

model = YOLO("yolo11n.pt")

image = "app/uploads/people-working-construction-site_1048944-24148010.jpg"

results = model(image)

for result in results:
    print(result)

    for box in result.boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])

        print(
            model.names[cls],
            round(conf, 3)
        )