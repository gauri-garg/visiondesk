from app.services.pose_service import pose_service

people = pose_service.analyse(
    r"app/uploads/WhatsApp Image 2026-07-03 at 11.38.14.jpeg"
)

for i, p in enumerate(people):

    print()

    print("Worker", i + 1)

    print("Head :", p["head_visible"])

    print("Upper Body :", p["upper_body_visible"])

    print("Hands :", p["hands_visible"])

    print("Feet :", p["feet_visible"])