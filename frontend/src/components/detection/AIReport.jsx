import { Bot, Copy, Download } from "lucide-react";

export default function AIReport({

  report,

}) {

  function copyReport() {

    navigator.clipboard.writeText(report);

    alert("AI Report copied.");

  }

  function downloadReport() {

    const blob = new Blob(

      [report],

      {

        type: "text/plain",

      }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "VisionDesk_AI_Report.txt";

    a.click();

    URL.revokeObjectURL(url);

  }

  return (

    <div className="mt-10 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl">

      <div className="flex items-center justify-between border-b border-slate-800 p-6">

        <div className="flex items-center gap-4">

          <div className="rounded-xl bg-blue-600 p-3">

            <Bot

              size={28}

              className="text-white"

            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">

              Gemini AI Safety Report

            </h2>

            <p className="text-slate-400">

              Automatically generated workplace inspection report

            </p>

          </div>

        </div>

        <div className="flex gap-3">

          <button

            onClick={copyReport}

            className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"

          >

            <Copy size={18} />

          </button>

          <button

            onClick={downloadReport}

            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"

          >

            <Download size={18} />

          </button>

        </div>

      </div>

      <div className="max-h-[500px] overflow-y-auto p-8">

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8">

          <pre className="whitespace-pre-wrap text-base leading-8 text-slate-200 font-sans">

            {report}

          </pre>

        </div>

      </div>

    </div>

  );

}