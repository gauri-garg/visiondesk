from ultralytics import YOLO

pose_model = YOLO("yolo11n-pose.pt")


class PoseService:

    def analyse(self, image_path: str):

        results = pose_model(image_path)

        people = []

        for result in results:

            if result.keypoints is None:
                continue

            for kp in result.keypoints.xy:

                points = kp.tolist()

                person = {

                    "head_visible": False,

                    "upper_body_visible": False,

                    "hands_visible": False,

                    "feet_visible": False,

                    "keypoints": points

                }

                # Nose
                if points[0][0] > 0 and points[0][1] > 0:
                    person["head_visible"] = True

                # Shoulders
                if (
                    points[5][0] > 0 and
                    points[6][0] > 0
                ):
                    person["upper_body_visible"] = True

                # Wrists
                if (
                    points[9][0] > 0 or
                    points[10][0] > 0
                ):
                    person["hands_visible"] = True

                # Ankles
                if (
                    points[15][0] > 0 or
                    points[16][0] > 0
                ):
                    person["feet_visible"] = True

                people.append(person)

        return people


pose_service = PoseService()