import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Camera,
  ExternalLink,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function shortName(filename) {
  const base = filename.replace(/_report\.pdf$/, "");
  return base.length > 42 ? base.slice(0, 42) + "…" : base;
}

function ScoreCell({ score }) {
  if (score == null) return <span className="text-slate-500">—</span>;
  const cls =
    score >= 80
      ? "text-green-400"
      : score >= 50
      ? "text-yellow-400"
      : "text-red-400";
  return <span className={`font-semibold ${cls}`}>{score}%</span>;
}

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function fetchReports() {
    try {
      const { data } = await axios.get(`${API_URL}/api/report/list`);
      setReports(Array.isArray(data) ? data : data.reports ?? []);
      setError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        setReports([]);
      } else {
        setError("Could not load reports.");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }

useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, []);

  async function handleDelete(id, filename) {
    if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}/api/report/${id}`);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete report.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-2xl bg-blue-600 p-2.5 shadow-lg shadow-blue-500/30 sm:p-3">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                Reports
              </h1>
              <p className="text-sm text-slate-400 sm:text-base">
                {reports.length} generated PDF inspection report
                {reports.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/detect")}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:px-5"
          >
            <Camera size={16} />
            New Detection
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 size={24} className="mr-3 animate-spin" />
              Loading reports…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <AlertTriangle size={40} className="mb-4 text-red-400" />
              <p className="text-lg font-semibold text-red-400">{error}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
              <FileText size={56} className="mb-5 opacity-25" />
              <p className="text-xl font-semibold text-slate-300">
                No reports yet
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Run an AI detection to generate your first report.
              </p>
              <button
                onClick={() => navigate("/detect")}
                className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Camera size={16} />
                Go to AI Detection
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4">Report</th>
                    <th className="pb-3 pr-4 whitespace-nowrap">Generated</th>
                    <th className="pb-3 pr-4">Safety Score</th>
                    <th className="pb-3 pr-4">Violations</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="transition-colors hover:bg-slate-800/50"
                    >
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <FileText
                            size={16}
                            className="shrink-0 text-blue-400"
                          />
                          <span
                            className="font-medium text-white"
                            title={report.filename}
                          >
                            {shortName(report.filename)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 whitespace-nowrap text-slate-400">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <ScoreCell score={report.safety_score} />
                      </td>
                      <td className="py-3.5 pr-4 text-slate-300">
                        {report.violations ?? "—"}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`${API_URL}/${report.pdf_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-900/30 hover:text-blue-300"
                          >
                            <ExternalLink size={13} />
                            Open
                          </a>
                          <button
                            onClick={() =>
                              handleDelete(report.id, report.filename)
                            }
                            disabled={deletingId === report.id}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-900/30 hover:text-red-300 disabled:opacity-50"
                          >
                            {deletingId === report.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}