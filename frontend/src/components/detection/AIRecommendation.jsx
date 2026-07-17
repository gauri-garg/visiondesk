export default function AIRecommendation({
  workers,
  violations,
  score,
}) {

  let recommendation = "";

  if (score >= 90) {

    recommendation =
      "Excellent PPE compliance. Continue monitoring.";

  } else if (score >= 70) {

    recommendation =
      "Some workers are missing PPE. Correct the violations.";

  } else {

    recommendation =
      "High safety risk. Immediate action is recommended.";

  }

  return (

    <div className="rounded-xl bg-slate-900 p-8 mt-8">

      <h2 className="text-2xl font-bold">

        AI Recommendation

      </h2>

      <div className="mt-6 space-y-3">

        <p>
          Workers Detected:
          <strong> {workers}</strong>
        </p>

        <p>
          Violations:
          <strong> {violations}</strong>
        </p>

        <p className="text-blue-400">

          {recommendation}

        </p>

      </div>

    </div>

  );

}