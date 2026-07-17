export default function IncidentTimeline({ summary }) {

  const timeline = summary.timeline || [];

  return (

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-bold text-white">

        Inspection Timeline

      </h2>

      {timeline.length === 0 ? (

        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-700">

          <p className="text-slate-400">

            No inspections available.

          </p>

        </div>

      ) : (

        <div className="space-y-5 max-h-[420px] overflow-y-auto">

          {timeline.map((item, index) => (

            <div
              key={index}
              className="relative border-l-2 border-blue-500 pl-5"
            >

              <div className="absolute -left-[7px] top-2 h-3 w-3 rounded-full bg-blue-500"></div>

              <h3 className="font-semibold text-white break-all">

                {item.filename}

              </h3>

              <p className="mt-1 text-sm text-slate-400">

                {item.time}

              </p>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}