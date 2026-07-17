import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=API_KEY)


class GeminiService:

    def ask(self, prompt: str):

        try:

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )

            if hasattr(response, "text") and response.text:
                return response.text

            return "AI response unavailable."

        except Exception:

            return (
                "⚠️ Gemini AI is temporarily unavailable because the "
                "API quota has been exceeded. "
                "Please try again later or use a different API key."
            )

    def generate_report(
        self,
        workers,
        stats,
        missing,
        score,
        risk,
    ):

        prompt = f"""
Workers: {workers}
Detected PPE: {stats}
Missing PPE: {missing}
Safety Score: {score}
Risk: {risk}

Generate a workplace safety inspection report.
"""

        try:

            return self.ask(prompt)

        except Exception:

            report = f"""
VisionDesk AI Safety Report

Workers Detected : {workers}

Safety Score : {score}%

Risk Level : {risk}

Detected PPE

Helmet : {stats.get("helmet",0)}
Vest : {stats.get("vest",0)}
Gloves : {stats.get("gloves",0)}
Goggles : {stats.get("goggles",0)}
Boots : {stats.get("boots",0)}

Missing PPE

Helmet : {missing.get("helmet",0)}
Vest : {missing.get("vest",0)}
Gloves : {missing.get("gloves",0)}
Goggles : {missing.get("goggles",0)}
Boots : {missing.get("boots",0)}

Recommendations

• Ensure every worker wears complete PPE.
• Replace missing helmets immediately.
• Verify boots and gloves before work begins.
• Conduct a daily PPE inspection.
• Continue monitoring using VisionDesk AI.

"""

            return report


gemini_service = GeminiService()