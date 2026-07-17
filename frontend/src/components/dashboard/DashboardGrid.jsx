import StatCard from "./StatCard";

export default function DashboardGrid() {
  return (
    <div className="grid md:grid-cols-4 gap-6">

      <StatCard
        title="Safety Score"
        value="96%"
        color="text-green-500"
      />

      <StatCard
        title="Violations"
        value="08"
        color="text-red-500"
      />

      <StatCard
        title="Active Cameras"
        value="12"
        color="text-blue-500"
      />

      <StatCard
        title="Reports"
        value="45"
        color="text-yellow-500"
      />

    </div>
  );
}