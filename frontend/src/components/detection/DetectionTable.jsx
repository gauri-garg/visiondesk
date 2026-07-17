import { useMemo, useState } from "react";
import {
  Search,
  Download,
  CheckCircle2,
} from "lucide-react";

export default function DetectionTable({

  detections,

}) {

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {

    return detections.filter((d) =>
      d.label
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  }, [detections, search]);

  function exportCSV() {

    const rows = [

      ["Label", "Confidence"],

      ...filtered.map((d) => [

        d.label,

        `${(d.confidence * 100).toFixed(1)}%`

      ])

    ];

    const csv = rows
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob(

      [csv],

      {

        type: "text/csv",

      }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "VisionDesk_Detections.csv";

    link.click();

    URL.revokeObjectURL(url);

  }

  function badgeColor(label) {

    switch (label.toLowerCase()) {

      case "person":
        return "bg-blue-600";

      case "helmet":
        return "bg-green-600";

      case "vest":
        return "bg-cyan-600";

      case "gloves":
        return "bg-purple-600";

      case "goggles":
        return "bg-orange-600";

      case "boots":
        return "bg-pink-600";

      default:
        return "bg-slate-600";

    }

  }

  return (

    <div className="mt-10 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl">

      <div className="flex flex-col gap-4 border-b border-slate-800 p-6 md:flex-row md:items-center md:justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">

            Detection Results

          </h2>

          <p className="text-slate-400">

            {filtered.length} Objects Detected

          </p>

        </div>

        <div className="flex gap-3">

          <div className="relative">

            <Search

              className="absolute left-3 top-3 text-slate-500"

              size={18}

            />

            <input

              value={search}

              onChange={(e) =>
                setSearch(e.target.value)
              }

              placeholder="Search..."

              className="rounded-xl bg-slate-800 py-2 pl-10 pr-4 text-white outline-none"

            />

          </div>

          <button

            onClick={exportCSV}

            className="rounded-xl bg-blue-600 px-5 hover:bg-blue-700"

          >

            <Download className="text-white" />

          </button>

        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b border-slate-800 text-left">

              <th className="p-5 text-slate-400">

                #

              </th>

              <th className="p-5 text-slate-400">

                Label

              </th>

              <th className="p-5 text-slate-400">

                Confidence

              </th>

              <th className="p-5 text-slate-400">

                Status

              </th>

            </tr>

          </thead>

          <tbody>

            {filtered.map((d, index) => (

              <tr

                key={index}

                className="border-b border-slate-800 hover:bg-slate-800/50"

              >

                <td className="p-5 text-white">

                  {index + 1}

                </td>

                <td className="p-5">

                  <span

                    className={`rounded-full px-4 py-2 text-sm text-white ${badgeColor(d.label)}`}

                  >

                    {d.label}

                  </span>

                </td>

                <td className="p-5 w-[320px]">

                  <div className="flex items-center gap-4">

                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">

                      <div

                        className="h-3 rounded-full bg-green-500"

                        style={{

                          width: `${d.confidence * 100}%`

                        }}

                      />

                    </div>

                    <span className="font-semibold text-white">

                      {(d.confidence * 100).toFixed(1)}%

                    </span>

                  </div>

                </td>

                <td className="p-5">

                  <div className="flex items-center gap-2 text-green-400">

                    <CheckCircle2 size={18} />

                    Valid

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}