import { ShieldCheck } from "lucide-react";

export default function SafetyScore({

  score,

  risk,

}) {

  const radius = 90;

  const stroke = 12;

  const normalizedRadius = radius - stroke * 2;

  const circumference =
    normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference -
    (score / 100) * circumference;

  let color = "#22c55e";

  let bg = "bg-green-500/20";

  let border = "border-green-500/40";

  let message =
    "Excellent PPE Compliance";

  if (risk === "MEDIUM") {

    color = "#eab308";

    bg = "bg-yellow-500/20";

    border = "border-yellow-500/40";

    message =
      "Moderate Risk - Improve PPE Usage";

  }

  if (risk === "HIGH") {

    color = "#ef4444";

    bg = "bg-red-500/20";

    border = "border-red-500/40";

    message =
      "Critical Risk - Immediate Action Required";

  }

  return (

    <div className="mt-10 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-10 shadow-xl">

      <div className="grid items-center gap-10 lg:grid-cols-2">

        <div className="flex justify-center">

          <div className="relative">

            <svg

              height={radius * 2}

              width={radius * 2}

            >

              <circle

                stroke="#1e293b"

                fill="transparent"

                strokeWidth={stroke}

                r={normalizedRadius}

                cx={radius}

                cy={radius}

              />

              <circle

                stroke={color}

                fill="transparent"

                strokeWidth={stroke}

                strokeLinecap="round"

                strokeDasharray={`${circumference} ${circumference}`}

                style={{

                  strokeDashoffset,

                  transition:

                    "stroke-dashoffset 1s ease",

                }}

                r={normalizedRadius}

                cx={radius}

                cy={radius}

                transform={`rotate(-90 ${radius} ${radius})`}

              />

            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <h1 className="text-5xl font-bold text-white">

                {score}%

              </h1>

              <p className="mt-2 text-slate-400">

                Safety Score

              </p>

            </div>

          </div>

        </div>

        <div>

          <div
            className={`rounded-2xl border ${border} ${bg} p-8`}
          >

            <div className="flex items-center gap-4">

              <ShieldCheck

                size={42}

                color={color}

              />

              <div>

                <h2 className="text-3xl font-bold text-white">

                  {risk}

                </h2>

                <p className="text-slate-400">

                  Risk Level

                </p>

              </div>

            </div>

            <div className="mt-8">

              <div className="mb-3 flex justify-between">

                <span className="text-slate-400">

                  Compliance

                </span>

                <span className="text-white">

                  {score}%

                </span>

              </div>

              <div className="h-4 overflow-hidden rounded-full bg-slate-800">

                <div

                  className="h-4 rounded-full transition-all duration-1000"

                  style={{

                    width: `${score}%`,

                    backgroundColor: color,

                  }}

                />

              </div>

            </div>

            <div className="mt-8 rounded-xl bg-slate-900 p-5">

              <h3 className="text-lg font-semibold text-white">

                AI Status

              </h3>

              <p className="mt-3 text-slate-300">

                {message}

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}