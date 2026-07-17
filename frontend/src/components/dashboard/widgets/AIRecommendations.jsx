export default function AIRecommendations({ summary }) {

  const score = summary.safety_score || 0;

  const workers = summary.workers || 0;

  const violations = summary.violations || 0;

  const stats = summary.stats || {};

  const recommendations = [];

  if (score < 50) {

    recommendations.push(
      "Immediate workplace inspection is required."
    );

  } else if (score < 80) {

    recommendations.push(
      "Improve PPE compliance to reduce workplace risks."
    );

  } else {

    recommendations.push(
      "Maintain current PPE compliance and continue routine inspections."
    );

  }

  if ((stats.helmet || 0) < workers) {

    recommendations.push(
      "Ensure every worker wears a safety helmet."
    );

  }

  if ((stats.vest || 0) < workers) {

    recommendations.push(
      "High-visibility safety vests should be mandatory."
    );

  }

  if ((stats.gloves || 0) < workers) {

    recommendations.push(
      "Workers should wear protective gloves when handling equipment."
    );

  }

  if ((stats.boots || 0) < workers) {

    recommendations.push(
      "Provide certified safety boots for all workers."
    );

  }

  if ((stats.goggles || 0) < workers) {

    recommendations.push(
      "Eye protection is required in hazardous work areas."
    );

  }

  return (

    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-bold text-white">

        AI Recommendations

      </h2>

      <div className="space-y-4">

        <div className="rounded-lg bg-slate-800 p-4">

          <p className="text-slate-300">

            Workers Detected

          </p>

          <p className="mt-1 text-2xl font-bold text-white">

            {workers}

          </p>

        </div>

        <div className="rounded-lg bg-slate-800 p-4">

          <p className="text-slate-300">

            Safety Score

          </p>

          <p className="mt-1 text-2xl font-bold text-green-400">

            {score}%

          </p>

        </div>

        <div className="rounded-lg bg-slate-800 p-4">

          <p className="text-slate-300">

            Violations

          </p>

          <p className="mt-1 text-2xl font-bold text-red-400">

            {violations}

          </p>

        </div>

      </div>

      <div className="mt-8">

        <h3 className="mb-4 text-lg font-semibold text-white">

          Recommended Actions

        </h3>

        <ul className="space-y-3">

          {recommendations.map((item, index) => (

            <li
              key={index}
              className="rounded-lg bg-slate-800 p-3 text-slate-300"
            >

              • {item}

            </li>

          ))}

        </ul>

      </div>

    </div>

  );

}