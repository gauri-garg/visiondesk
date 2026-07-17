from pathlib import Path
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle,
)


class PDFReport:

    def generate(
        self,
        filename,
        original_image,
        annotated_image,
        stats,
        violations,
        score,
        risk,
        ai_report,
    ):

        output_dir = Path("app/generated_reports")
        output_dir.mkdir(exist_ok=True)

        pdf_path = output_dir / f"{Path(filename).stem}_report.pdf"

        doc = SimpleDocTemplate(str(pdf_path))

        styles = getSampleStyleSheet()

        elements = []

        # ----------------------------------------------------

        title = Paragraph(
            "<b><font size=22 color='blue'>VisionDesk AI</font></b>",
            styles["Title"],
        )

        elements.append(title)

        elements.append(
            Paragraph(
                "AI Workplace Safety Inspection Report",
                styles["Heading2"],
            )
        )

        elements.append(Spacer(1, 20))

        # ----------------------------------------------------

        elements.append(
            Paragraph(
                f"<b>Date:</b> {datetime.now()}",
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                f"<b>Image:</b> {filename}",
                styles["Normal"],
            )
        )

        elements.append(Spacer(1, 15))

        # ----------------------------------------------------

        table = Table(
            [
                ["Workers", stats["Person"]],
                ["Helmets", stats["helmet"]],
                ["Vests", stats["vest"]],
                ["Gloves", stats["gloves"]],
                ["Goggles", stats["goggles"]],
                ["Boots", stats["boots"]],
                ["Violations", violations],
                ["Safety Score", f"{score}%"],
                ["Risk", risk],
            ],
            colWidths=[180, 120],
        )

        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightblue),
                    ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )

        elements.append(table)

        elements.append(Spacer(1, 25))

        # ----------------------------------------------------

        if Path(original_image).exists():

            elements.append(
                Paragraph(
                    "<b>Original Image</b>",
                    styles["Heading2"],
                )
            )

            elements.append(
                Image(
                    original_image,
                    width=250,
                    height=180,
                )
            )

            elements.append(Spacer(1, 20))

        # ----------------------------------------------------

        if Path(annotated_image).exists():

            elements.append(
                Paragraph(
                    "<b>AI Detection</b>",
                    styles["Heading2"],
                )
            )

            elements.append(
                Image(
                    annotated_image,
                    width=250,
                    height=180,
                )
            )

            elements.append(Spacer(1, 20))

        # ----------------------------------------------------

        elements.append(
            Paragraph(
                "<b>Gemini AI Report</b>",
                styles["Heading2"],
            )
        )

        elements.append(
            Paragraph(
                ai_report.replace("\n", "<br/>"),
                styles["BodyText"],
            )
        )

        elements.append(Spacer(1, 30))

        elements.append(
            Paragraph(
                "Generated automatically by VisionDesk AI",
                styles["Italic"],
            )
        )

        doc.build(elements)

        return str(pdf_path)


pdf_report = PDFReport()