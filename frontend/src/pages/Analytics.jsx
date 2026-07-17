import { useEffect, useState } from "react";
import { BarChart3, ShieldCheck, TriangleAlert, Camera } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getDashboardSummary } from "@/services/dashboardService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PPE_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
];

function StatCard({ icon: Icon, title, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className={`mt-2 text-4xl font-extrabold ${color}`}>{value}</p>
        </div>
        <div className={`rounded-xl bg-slate-800 p-3 ${color}`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Build chart data from stats
  const ppeChartData = summary?.stats
    ? Object.entries(summary.stats).map(([name, value]) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: Number(value),
      }))
    : [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-600 p-3 shadow-lg shadow-blue-500/30">
            <BarChart3 size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Analytics</h1>
            <p className="text-slate-400">
              Safety performance overview from the latest inspection
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <span className="ml-3">Loading analytics…</span>
          </div>
        ) : !summary ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 py-20 text-slate-500">
            <BarChart3 size={56} className="mb-5 opacity-25" />
            <p className="text-xl font-semibold text-slate-300">
              No data available
            </p>
            <p className="mt-2 text-sm">
              Run an AI detection to see analytics here.
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <StatCard
                icon={ShieldCheck}
                title="Safety Score"
                value={`${summary.safety_score ?? 0}%`}
                color="text-green-400"
              />
              <StatCard
                icon={TriangleAlert}
                title="Violations"
                value={summary.violations ?? 0}
                color="text-red-400"
              />
              <StatCard
                icon={Camera}
                title="Workers Detected"
                value={summary.workers ?? 0}
                color="text-blue-400"
              />
            </div>

            {/* Charts */}
            {ppeChartData.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Bar Chart */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <h2 className="mb-5 text-lg font-bold text-white">
                    PPE Detection Breakdown
                  </h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={ppeChartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        angle={-15}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          color: "#f1f5f9",
                        }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <h2 className="mb-5 text-lg font-bold text-white">
                    PPE Distribution
                  </h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={ppeChartData}
                        cx="50%"
                        cy="45%"
                        outerRadius={90}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {ppeChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PPE_COLORS[index % PPE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend
                        wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          color: "#f1f5f9",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Risk Level */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-3 text-lg font-bold text-white">
                Current Risk Level
              </h2>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-block rounded-full px-5 py-2 text-lg font-extrabold ${
                    summary.risk === "LOW"
                      ? "bg-green-900/50 text-green-400"
                      : summary.risk === "MEDIUM"
                      ? "bg-yellow-900/50 text-yellow-400"
                      : "bg-red-900/50 text-red-400"
                  }`}
                >
                  {summary.risk ?? "UNKNOWN"}
                </span>
                <p className="text-sm text-slate-400">
                  Based on the most recent AI inspection results.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
