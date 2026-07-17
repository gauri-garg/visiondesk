import { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  Search,
  Trash2,
  FileText,
  BookOpen,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
  searchKnowledgeBase,
} from "@/services/knowledgeBaseService";

const CATEGORIES = [
  { value: "safety_manual", label: "Safety Manual" },
  { value: "incident_report", label: "Incident Report" },
  { value: "inspection_report", label: "Inspection Report" },
  { value: "compliance_document", label: "Compliance Document" },
];

// Mirrors the pipeline in app/services/document_processor.py:
// pending -> processing -> extracted -> chunked -> embedding -> completed | failed
const TERMINAL_STATUSES = new Set(["completed", "failed"]);

const MAX_FILE_SIZE_BYTES = 52_428_800; // matches the backend's 50 MB cap

function StatusBadge({ status }) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1";

  if (status === "completed") {
    return (
      <span className={`${base} bg-green-900/50 text-green-400 ring-green-500/30`}>
        <CheckCircle size={12} />
        Completed
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className={`${base} bg-red-900/50 text-red-400 ring-red-500/30`}>
        <XCircle size={12} />
        Failed
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className={`${base} bg-slate-700/50 text-slate-400 ring-slate-600/30`}>
        <Clock size={12} />
        Pending
      </span>
    );
  }
  // processing / extracted / chunked / embedding
  return (
    <span className={`${base} bg-yellow-900/50 text-yellow-400 ring-yellow-500/30`}>
      <Loader2 size={12} className="animate-spin" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  // upload_timestamp is naive UTC from the backend; treat it as UTC.
  const normalised =
    typeof dateStr === "string" && !/[Zz]|[+-]\d{2}:?\d{2}$/.test(dateStr)
      ? `${dateStr}Z`
      : dateStr;
  const d = new Date(normalised);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function categoryLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value ?? "—";
}

export default function KnowledgeBase() {
  // Upload state
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("safety_manual");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Documents list state
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchMessage, setSearchMessage] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      // GET /api/documents returns DocumentListResponse:
      // { items: [...], total, page, page_size }
      const data = await listDocuments();
      setDocuments(Array.isArray(data) ? data : (data?.items ?? []));
      setDocsError(null);
    } catch (err) {
      console.error("Failed to fetch documents", err);
      setDocsError(
        err.response?.data?.detail ??
          "Could not reach the API. Is the backend running on port 8000?"
      );
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Poll while any document is still moving through the pipeline
  useEffect(() => {
    const hasActive = documents.some((d) => !TERMINAL_STATUSES.has(d.status));
    if (!hasActive) return;
    const interval = setInterval(fetchDocuments, 3000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;

    const isPdf =
      selected.type === "application/pdf" ||
      selected.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setUploadStatus({ type: "error", message: "Only PDF files are allowed." });
      setFile(null);
      e.target.value = "";
      return;
    }
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setUploadStatus({
        type: "error",
        message: "That file is over the 50 MB limit.",
      });
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(selected);
    setUploadStatus(null);
  }

  async function handleUpload() {
    if (!file) {
      setUploadStatus({ type: "error", message: "Choose a PDF first." });
      return;
    }
    setUploading(true);
    setUploadStatus(null);
    try {
      await uploadDocument(file, category);
      setUploadStatus({
        type: "success",
        message: `"${file.name}" uploaded. Processing started.`,
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchDocuments();
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail ?? err.message ?? "Upload failed.";
      setUploadStatus({
        type: "error",
        message: typeof detail === "string" ? detail : JSON.stringify(detail),
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId, filename) {
    if (!docId) return;
    if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    setDeletingId(docId);
    try {
      await deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
    } catch (err) {
      console.error(err);
      setDocsError(
        err.response?.data?.detail ?? "Delete failed. Check the API logs."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults(null);
    setSearchMessage(null);
    setSearchError(null);
    try {
      // POST /api/documents/search returns SearchResponse:
      // { results: [{ chunk_text, document_id, source_filename,
      //               page_number, category, similarity_score }], message }
      const data = await searchKnowledgeBase(searchQuery.trim());
      setSearchResults(Array.isArray(data) ? data : (data?.results ?? []));
      setSearchMessage(data?.message ?? null);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail ?? err.message ?? "Search failed.";
      setSearchError(
        typeof detail === "string" ? detail : JSON.stringify(detail)
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        {/* Page header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="shrink-0 rounded-2xl bg-blue-600 p-2.5 shadow-lg shadow-blue-500/30 sm:p-3">
            <BookOpen size={24} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
              Knowledge Base
            </h1>
            <p className="text-sm text-slate-400 sm:text-base">
              Upload and search safety documents for AI-powered answers
            </p>
          </div>
        </div>

        {/* Upload */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white sm:mb-5 sm:text-xl">
            <Upload size={20} className="text-blue-400" />
            Upload Document
          </h2>

          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
            <div className="min-w-0">
              <label
                htmlFor="kb-file"
                className="mb-1.5 block text-sm text-slate-400"
              >
                PDF File
              </label>
              <input
                id="kb-file"
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
              />
            </div>

            <div className="md:w-52">
              <label
                htmlFor="kb-category"
                className="mb-1.5 block text-sm text-slate-400"
              >
                Category
              </label>
              <select
                id="kb-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-white outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload
                </>
              )}
            </button>
          </div>

          {uploadStatus && (
            <div
              className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
                uploadStatus.type === "success"
                  ? "bg-green-900/40 text-green-300 ring-1 ring-green-500/30"
                  : "bg-red-900/40 text-red-300 ring-1 ring-red-500/30"
              }`}
            >
              {uploadStatus.message}
            </div>
          )}

          {file && !uploadStatus && (
            <p className="mt-3 break-all text-sm text-slate-400">
              Selected: <span className="text-white">{file.name}</span> (
              {(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white sm:mb-5 sm:text-xl">
            <Search size={20} className="text-blue-400" />
            Search Knowledge Base
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ask a question or search for safety topics…"
              className="h-12 min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {searching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {searching ? "Searching…" : "Search"}
            </button>
          </div>

          {searchError && (
            <div className="mt-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">
              {searchError}
            </div>
          )}

          {searchResults !== null && (
            <div className="mt-5 space-y-3">
              {/* The API sends `message` when nothing has been indexed yet */}
              {searchMessage && (
                <p className="text-sm text-slate-400">{searchMessage}</p>
              )}

              {searchResults.length === 0 && !searchMessage ? (
                <p className="text-sm text-slate-400">
                  No matches. Try different wording, or upload a document first.
                </p>
              ) : (
                <>
                  {searchResults.length > 0 && (
                    <p className="text-sm text-slate-400">
                      {searchResults.length} result
                      {searchResults.length !== 1 ? "s" : ""}
                    </p>
                  )}

                  {searchResults.map((result, idx) => (
                    <div
                      key={`${result.document_id}-${idx}`}
                      className="rounded-xl border border-slate-700 bg-slate-800 p-4"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-blue-900/50 px-2.5 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30">
                          <FileText size={11} className="shrink-0" />
                          <span className="truncate">
                            {result.source_filename || "Document"}
                          </span>
                        </span>

                        {result.page_number != null && (
                          <span className="text-xs text-slate-400">
                            Page {result.page_number}
                          </span>
                        )}

                        {result.category && (
                          <span className="text-xs text-slate-500">
                            {categoryLabel(result.category)}
                          </span>
                        )}

                        {result.similarity_score != null && (
                          <span className="ml-auto text-xs font-medium text-slate-400">
                            {(result.similarity_score * 100).toFixed(0)}% match
                          </span>
                        )}
                      </div>

                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
                        {result.chunk_text}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl">
              <FileText size={20} className="text-blue-400" />
              Documents ({documents.length})
            </h2>
            <button
              onClick={() => {
                setDocsLoading(true);
                fetchDocuments();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {docsError && (
            <div className="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">
              {docsError}
            </div>
          )}

          {docsLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={24} className="mr-3 animate-spin" />
              Loading documents…
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 sm:py-16">
              <BookOpen size={44} className="mb-4 opacity-30" />
              <p className="text-lg font-semibold">No documents yet</p>
              <p className="mt-1 text-sm">Upload a PDF above to get started</p>
            </div>
          ) : (
            <>
              {/* Mobile: cards. A 6-column table cannot fit a phone. */}
              <div className="space-y-3 md:hidden">
                {documents.map((doc) => (
                  <div
                    key={doc.document_id}
                    className="rounded-xl border border-slate-800 bg-slate-800/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2">
                        <FileText
                          size={16}
                          className="mt-0.5 shrink-0 text-blue-400"
                        />
                        <span className="break-all text-sm font-medium text-white">
                          {doc.filename}
                        </span>
                      </div>
                      <StatusBadge status={doc.status ?? "pending"} />
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div>
                        <dt className="text-slate-500">Category</dt>
                        <dd className="text-slate-300">
                          {categoryLabel(doc.category)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Chunks</dt>
                        <dd className="text-slate-300">
                          {doc.chunk_count ?? "—"}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-slate-500">Uploaded</dt>
                        <dd className="text-slate-300">
                          {formatDate(doc.upload_timestamp)}
                        </dd>
                      </div>
                    </dl>

                    {doc.status === "failed" && doc.error_message && (
                      <p className="mt-2 break-words rounded-md bg-red-950/50 px-2 py-1.5 text-xs text-red-300">
                        {doc.error_message}
                      </p>
                    )}

                    <button
                      onClick={() => handleDelete(doc.document_id, doc.filename)}
                      disabled={deletingId === doc.document_id}
                      className="mt-3 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-900/30 hover:text-red-300 disabled:opacity-50"
                    >
                      {deletingId === doc.document_id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="pb-3 pr-4">Filename</th>
                      <th className="pb-3 pr-4">Category</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Uploaded</th>
                      <th className="pb-3 pr-4">Pages</th>
                      <th className="pb-3 pr-4">Chunks</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {documents.map((doc) => (
                      <tr
                        key={doc.document_id}
                        className="transition-colors hover:bg-slate-800/50"
                      >
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2">
                            <FileText
                              size={16}
                              className="shrink-0 text-blue-400"
                            />
                            <span
                              className="max-w-xs truncate font-medium text-white"
                              title={doc.filename}
                            >
                              {doc.filename}
                            </span>
                          </div>
                          {doc.status === "failed" && doc.error_message && (
                            <p
                              className="mt-1 max-w-xs truncate text-xs text-red-400"
                              title={doc.error_message}
                            >
                              {doc.error_message}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-300">
                          {categoryLabel(doc.category)}
                        </td>
                        <td className="py-3.5 pr-4">
                          <StatusBadge status={doc.status ?? "pending"} />
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap text-slate-400">
                          {formatDate(doc.upload_timestamp)}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-400">
                          {doc.page_count ?? "—"}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-400">
                          {doc.chunk_count ?? "—"}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() =>
                              handleDelete(doc.document_id, doc.filename)
                            }
                            disabled={deletingId === doc.document_id}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-900/30 hover:text-red-300 disabled:opacity-50"
                          >
                            {deletingId === doc.document_id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
