const API = "http://127.0.0.1:8000";

export default function RecentReports({ summary }) {

  const reports = summary.recent_reports || [];

  return (

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-bold text-white">

        Recent Reports

      </h2>

      {reports.length === 0 ? (

        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-700">

          <p className="text-slate-400">

            No reports generated yet.

          </p>

        </div>

      ) : (

        <div className="space-y-4 max-h-[420px] overflow-y-auto">

          {reports.map((report, index) => (

            <div
              key={index}
              className="rounded-xl bg-slate-800 p-4"
            >

              <h3 className="font-semibold text-white break-all">

                {report.name}

              </h3>

              <p className="mt-2 text-sm text-slate-400">

                {report.time}

              </p>

              <div className="mt-4 flex gap-3">

                <a
                  href={`${API}${report.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
                >

                  View

                </a>

                <a
                  href={`${API}${report.path}`}
                  download
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition hover:bg-green-700"
                >

                  Download

                </a>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}