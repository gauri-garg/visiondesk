from math import sqrt


class ComplianceService:

    def center(self, bbox):

        x1, y1, x2, y2 = bbox

        return (
            (x1 + x2) / 2,
            (y1 + y2) / 2,
        )

    def distance(self, a, b):

        ax, ay = self.center(a)

        bx, by = self.center(b)

        return sqrt(
            (ax - bx) ** 2 +
            (ay - by) ** 2
        )

    def inside_person(self, person_bbox, object_bbox):

        px1, py1, px2, py2 = person_bbox

        ox, oy = self.center(object_bbox)

        return (
            px1 <= ox <= px2 and
            py1 <= oy <= py2
        )

    def analyse(self, detections):

        persons = []

        for detection in detections:

            if detection["label"] == "Person":

                persons.append(detection)

        workers = []

        used = {
            "helmet": set(),
            "vest": set(),
            "gloves": set(),
            "boots": set(),
            "goggles": set(),
        }

        labels = [
            "helmet",
            "vest",
            "gloves",
            "boots",
            "goggles",
        ]

        for worker_id, person in enumerate(persons):

            worker = {

                "id": worker_id + 1,

                "bbox": person["bbox"],

                "helmet": False,
                "vest": False,
                "gloves": False,
                "boots": False,
                "goggles": False,

            }

            for label in labels:

                best_index = None

                best_distance = 999999

                for index, obj in enumerate(detections):

                    if obj["label"] != label:
                        continue

                    if index in used[label]:
                        continue

                    if not self.inside_person(
                        person["bbox"],
                        obj["bbox"],
                    ):
                        continue

                    d = self.distance(
                        person["bbox"],
                        obj["bbox"],
                    )

                    if d < best_distance:

                        best_distance = d

                        best_index = index

                if best_index is not None:

                    worker[label] = True

                    used[label].add(best_index)

            workers.append(worker)

        return workers


compliance_service = ComplianceService()