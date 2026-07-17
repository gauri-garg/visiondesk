import {
  Camera,
  ShieldCheck,
  TriangleAlert,
  Users,
  HardHat,
  Shield,
  Hand,
  Glasses,
  Footprints,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

export default function LiveFeed({ summary }) {

  const stats = summary.stats || {};

  function RiskColor() {

    if (summary.risk === "HIGH")
      return "bg-red-500 text-white";

    if (summary.risk === "MEDIUM")
      return "bg-yellow-500 text-black";

    return "bg-green-500 text-white";

  }

  return (

    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl">

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold text-white">

            Live Inspection

          </h2>

          <p className="mt-2 text-slate-400">

            Latest VisionDesk AI Detection

          </p>

        </div>

        <span
          className={`rounded-full px-5 py-2 font-bold ${RiskColor()}`}
        >

          {summary.risk || "LOW"}

        </span>

      </div>

      {summary.latest_image ? (

        <>

          <div className="grid gap-8 lg:grid-cols-2">

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

              <div className="border-b border-slate-800 p-4">

                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">

                  <Camera size={20} />

                  Original Image

                </h3>

              </div>

              <img
                src={`${API}${summary.latest_image}`}
                alt="Original"
                className="h-80 w-full object-contain bg-black"
              />

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

              <div className="border-b border-slate-800 p-4">

                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">

                  <ShieldCheck size={20} />

                  AI Detection

                </h3>

              </div>

              <img
                src={`${API}${summary.latest_result}`}
                alt="Detection"
                className="h-80 w-full object-contain bg-black"
              />

            </div>

          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-4">

            <div className="rounded-2xl bg-slate-900 p-6">

              <Users
                className="mb-3 text-blue-400"
                size={32}
              />

              <p className="text-slate-400">

                Workers

              </p>

              <h2 className="mt-2 text-4xl font-bold text-white">

                {summary.workers}

              </h2>

            </div>

            <div className="rounded-2xl bg-slate-900 p-6">

              <TriangleAlert
                className="mb-3 text-red-400"
                size={32}
              />

              <p className="text-slate-400">

                Violations

              </p>

              <h2 className="mt-2 text-4xl font-bold text-red-400">

                {summary.violations}

              </h2>

            </div>

            <div className="rounded-2xl bg-slate-900 p-6">

              <ShieldCheck
                className="mb-3 text-green-400"
                size={32}
              />

              <p className="text-slate-400">

                Safety Score

              </p>

              <h2 className="mt-2 text-4xl font-bold text-green-400">

                {summary.safety_score}%

              </h2>

            </div>

            <div className="rounded-2xl bg-slate-900 p-6">

              <Camera
                className="mb-3 text-cyan-400"
                size={32}
              />

              <p className="text-slate-400">

                File

              </p>

              <h2 className="mt-2 break-all text-sm font-semibold text-white">

                {summary.filename}

              </h2>

            </div>

          </div>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h3 className="mb-6 text-2xl font-bold text-white">

              PPE Summary

            </h3>

            <div className="grid gap-5 md:grid-cols-5">

              <div className="rounded-xl bg-slate-800 p-5 text-center">

                <HardHat className="mx-auto text-green-400" />

                <p className="mt-3 text-slate-400">

                  Helmets

                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">

                  {stats.helmet}

                </h2>

              </div>

              <div className="rounded-xl bg-slate-800 p-5 text-center">

                <Shield className="mx-auto text-cyan-400" />

                <p className="mt-3 text-slate-400">

                  Vests

                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">

                  {stats.vest}

                </h2>

              </div>

              <div className="rounded-xl bg-slate-800 p-5 text-center">

                <Hand className="mx-auto text-purple-400" />

                <p className="mt-3 text-slate-400">

                  Gloves

                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">

                  {stats.gloves}

                </h2>

              </div>

              <div className="rounded-xl bg-slate-800 p-5 text-center">

                <Glasses className="mx-auto text-orange-400" />

                <p className="mt-3 text-slate-400">

                  Goggles

                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">

                  {stats.goggles}

                </h2>

              </div>

              <div className="rounded-xl bg-slate-800 p-5 text-center">

                <Footprints className="mx-auto text-pink-400" />

                <p className="mt-3 text-slate-400">

                  Boots

                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">

                  {stats.boots}

                </h2>

              </div>

            </div>

          </div>

        </>

      ) : (

        <div className="flex h-96 items-center justify-center rounded-2xl border-2 border-dashed border-slate-700">

          <div className="text-center">

            <Camera
              className="mx-auto mb-4 text-slate-500"
              size={60}
            />

            <h2 className="text-2xl font-bold text-white">

              No Inspection Yet

            </h2>

            <p className="mt-3 text-slate-400">

              Upload an image to begin AI analysis.

            </p>

          </div>

        </div>

      )}

    </div>

  );

}