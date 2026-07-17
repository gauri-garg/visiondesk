export default function StatCard({
  title,
  value,
  color,
}) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">

      <p className="text-slate-400">
        {title}
      </p>

      <h2
        className={`text-5xl font-bold mt-4 ${color}`}
      >
        {value}
      </h2>

    </div>
  );
}