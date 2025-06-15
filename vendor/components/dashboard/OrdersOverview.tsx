"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardService } from "@/services/dashboardService";

const COLORS = [
  "#10b981", // Green
  "#3b82f6", // Blue
  "#facc15", // Yellow
  "#6366f1", // Indigo
  "#ef4444", // Red
  "#a78bfa", // Purple
  "#ec4899", // Pink
];

export default function OrdersOverview() {
  const [data, setData] = useState<{ name: string; value: number; color?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await DashboardService.getOrdersByStatus();
      if (result && Array.isArray(result)) {
        const colored = result.map((d, i) => ({
          ...d,
          color: COLORS[i % COLORS.length],
        }));
        setData(colored);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <Card className="shadow-sm border">
      <CardBody>
        <h3 className="font-semibold text-lg mb-2">Orders Overview</h3>
        <p className="text-sm text-gray-500 mb-4">Order volume by status</p>
        <div className="h-60">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {!loading && (
          <div className="flex flex-wrap gap-2 mt-4 text-xs">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span>
                  {d.name} {d.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
