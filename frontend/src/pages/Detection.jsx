import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import { uploadImage } from "@/services/uploadService";
import { detectLatest } from "@/services/detectionService";
import { generateReport } from "@/services/reportService";

import DetectionHeader from "@/components/detection/DetectionHeader";
import ImageComparison from "@/components/detection/ImageComparison";
import PPECards from "@/components/detection/PPECards";
import DetectionTable from "@/components/detection/DetectionTable";
import SafetyScore from "@/components/detection/SafetyScore";
import AIRecommendation from "@/components/detection/AIRecommendation";
import AIReport from "@/components/detection/AIReport";

export default function Detection() {

  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const [preview, setPreview] = useState(null);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  function handleSelect(e) {

    const selected = e.target.files[0];

    if (!selected) return;

    setFile(selected);

    setPreview(URL.createObjectURL(selected));

  }

  async function handleUpload() {

    if (!file) {

      alert("Please select an image.");

      return;

    }

    setLoading(true);

    try {

      await uploadImage(file);

      const detection = await detectLatest();

      setResult(detection);

      // Refresh Dashboard Automatically
      window.dispatchEvent(
        new Event("visiondesk-refresh")
      );

    } catch (err) {

      console.error(err);

      alert("Detection failed.");

    }

    setLoading(false);

  }

  async function handleDownloadReport() {

    try {

      const report = await generateReport();

      window.open(
        `http://127.0.0.1:8000/${report.pdf}`,
        "_blank"
      );

    } catch (err) {

      console.error(err);

      alert("Failed to generate report.");

    }

  }

  return (

    <DashboardLayout>

      <div className="mx-auto max-w-7xl">

        <DetectionHeader />

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-wrap items-center gap-4">

           <input
            type="file"
            accept="image/*"
            onChange={handleSelect}
            className="w-full sm:flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
          />

            <button
              onClick={handleUpload}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
            >

              Upload & Detect

            </button>

            {result && (

              <>
                <button
                  onClick={handleDownloadReport}
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold transition hover:bg-green-700"
                >

                  Download PDF Report

                </button>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-lg bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-700"
                >

                  Go To Dashboard

                </button>

              </>

            )}

          </div>

        </div>

        {loading && (

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center text-xl">

            🤖 VisionDesk AI is analyzing the image...

          </div>

        )}

        {result && (

          <>

            <ImageComparison

              original={preview}

              annotated={result.annotated_image}

            />

            <PPECards

              stats={result.stats}

              workers={result.workers_count}

              violations={result.violations}

            />

            <SafetyScore

              score={result.safety_score}

              risk={result.risk}

            />

            <AIRecommendation

              workers={result.workers_count}

              violations={result.violations}

              score={result.safety_score}

            />

            <AIReport

              report={result.ai_report}

            />

            <DetectionTable

              detections={result.detections}

            />

          </>

        )}

      </div>

    </DashboardLayout>

  );

}