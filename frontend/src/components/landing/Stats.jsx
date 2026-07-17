export default function Stats() {
  const stats = [
    { value: "84%", label: "Detection Accuracy" },
    { value: "24/7", label: "Monitoring" },
    { value: "1K+", label: "Documents" },
    { value: "AI", label: "Insights" },
  ];

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold sm:mb-10 sm:text-3xl md:text-4xl">
          Platform Statistics
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center sm:p-6"
            >
              <h3 className="text-2xl font-bold text-blue-500 sm:text-3xl md:text-4xl">
                {value}
              </h3>
              <p className="mt-1 text-sm text-slate-400 sm:text-base">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
