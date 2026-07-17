import {
  HardHat,
  Shield,
  Glasses,
  Hand,
  Footprints,
  Users,
  AlertTriangle,
} from "lucide-react";

function PPECard({

  title,

  value,

  workers,

  icon,

  color,

}) {

  const notVisible = value === -1;

  const percentage =
    workers > 0 && !notVisible
      ? Math.round((value / workers) * 100)
      : 0;

  return (

    <div className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500 hover:shadow-blue-900/40">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-400">

            {title}

          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">

            {notVisible ? "--" : value}

          </h2>

        </div>

        <div
          className={`rounded-xl p-3 ${color}`}
        >

          {icon}

        </div>

      </div>

      <div className="mt-6">

        {notVisible ? (

          <span className="rounded-full bg-yellow-600/20 px-3 py-1 text-xs font-semibold text-yellow-300">

            Not Visible

          </span>

        ) : (

          <>
            <div className="mb-2 flex justify-between text-xs">

              <span className="text-slate-400">

                Compliance

              </span>

              <span className="text-white">

                {percentage}%

              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-700"
                style={{
                  width: `${percentage}%`,
                }}
              ></div>

            </div>

          </>

        )}

      </div>

    </div>

  );

}

export default function PPECards({

  stats,

  workers,

  violations,

}) {

  return (

    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">

      <PPECard

        title="Workers"

        value={workers}

        workers={workers}

        color="bg-blue-600/20"

        icon={
          <Users
            size={32}
            className="text-blue-400"
          />
        }

      />

      <PPECard

        title="Helmet"

        value={stats.helmet}

        workers={workers}

        color="bg-green-600/20"

        icon={
          <HardHat
            size={32}
            className="text-green-400"
          />
        }

      />

      <PPECard

        title="Vest"

        value={stats.vest}

        workers={workers}

        color="bg-cyan-600/20"

        icon={
          <Shield
            size={32}
            className="text-cyan-400"
          />
        }

      />

      <PPECard

        title="Gloves"

        value={stats.gloves}

        workers={workers}

        color="bg-purple-600/20"

        icon={
          <Hand
            size={32}
            className="text-purple-400"
          />
        }

      />

      <PPECard

        title="Goggles"

        value={stats.goggles}

        workers={workers}

        color="bg-orange-600/20"

        icon={
          <Glasses
            size={32}
            className="text-orange-400"
          />
        }

      />

      <PPECard

        title="Boots"

        value={stats.boots}

        workers={workers}

        color="bg-pink-600/20"

        icon={
          <Footprints
            size={32}
            className="text-pink-400"
          />
        }

      />

      <div className="group rounded-2xl border border-red-800 bg-gradient-to-br from-red-950 to-slate-950 p-5 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-red-900/40">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-red-300">

              Violations

            </p>

            <h2 className="mt-3 text-4xl font-bold text-red-400">

              {violations}

            </h2>

          </div>

          <div className="rounded-xl bg-red-600/20 p-3">

            <AlertTriangle
              size={32}
              className="text-red-400"
            />

          </div>

        </div>

        <div className="mt-6 rounded-full bg-red-900/30 px-3 py-2 text-center text-xs font-semibold text-red-300">

          Immediate Attention Required

        </div>

      </div>

    </div>

  );

}