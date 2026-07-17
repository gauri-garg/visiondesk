export default function RiskScore({ summary }) {

  const score = summary.safety_score || 0;

  let risk = "LOW";

  let color = "text-green-400";

  let ring = "stroke-green-500";

  if (score < 80) {

    risk = "MEDIUM";

    color = "text-yellow-400";

    ring = "stroke-yellow-500";

  }

  if (score < 50) {

    risk = "HIGH";

    color = "text-red-400";

    ring = "stroke-red-500";

  }

  const circumference = 2 * Math.PI * 45;

  const offset =
    circumference -
    (score / 100) * circumference;

  return (

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-bold text-white">

        Live Risk Score

      </h2>

      <div className="flex justify-center">

        <svg width="150" height="150">

          <circle

            cx="75"

            cy="75"

            r="45"

            fill="none"

            stroke="#334155"

            strokeWidth="10"

          />

          <circle

            cx="75"

            cy="75"

            r="45"

            fill="none"

            className={ring}

            strokeWidth="10"

            strokeDasharray={circumference}

            strokeDashoffset={offset}

            strokeLinecap="round"

            transform="rotate(-90 75 75)"

          />

          <text

            x="75"

            y="82"

            textAnchor="middle"

            className="fill-white text-2xl font-bold"

          >

            {score}%

          </text>

        </svg>

      </div>

      <div className="mt-6 text-center space-y-2">

        <h3 className={`text-2xl font-bold ${color}`}>

          {risk}

        </h3>

        <p className="text-slate-400">

          Current Workplace Risk

        </p>

      </div>

      <div className="mt-8 space-y-3">

        <div className="flex justify-between">

          <span className="text-slate-400">

            Workers

          </span>

          <span className="font-semibold text-white">

            {summary.workers}

          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-400">

            Violations

          </span>

          <span className="font-semibold text-red-400">

            {summary.violations}

          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-400">

            Reports

          </span>

          <span className="font-semibold text-white">

            {summary.reports}

          </span>

        </div>

      </div>

    </div>

  );

}