import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import { getDashboardSummary } from "@/services/dashboardService";

export default function ViolationsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadChart() {
      try {
        const summary = await getDashboardSummary();

        const stats = summary.stats || {};

        setData([
          {
            name: "Helmet",
            value: stats.helmet || 0,
          },
          {
            name: "Vest",
            value: stats.vest || 0,
          },
          {
            name: "Gloves",
            value: stats.gloves || 0,
          },
          {
            name: "Goggles",
            value: stats.goggles || 0,
          },
          {
            name: "Boots",
            value: stats.boots || 0,
          },
        ]);
      } catch (err) {
        console.error(err);
      }
    }

    loadChart();
  }, []);

  const colors = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#a855f7",
    "#ef4444",
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-bold text-white">
        PPE Detection Summary
      </h2>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={data}>

            <XAxis
              dataKey="name"
              stroke="#94a3b8"
            />

            <YAxis
              stroke="#94a3b8"
            />

            <Tooltip />

            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={colors[index]}
                />
              ))}
            </Bar>

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}