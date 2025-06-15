"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardService } from "@/services/dashboardService";

export default function RevenueOverview() {
  const [data, setData] = useState<{ name: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      const result = await DashboardService.getRevenueChart();
      if (result) setData(result);
      setLoading(false);
    }

    fetchRevenue();
  }, []);

  return (
    <Card className="shadow-sm border">
      <CardBody>
        <h3 className="font-semibold text-lg mb-2">Revenue Overview</h3>
        <p className="text-sm text-gray-500 mb-4">
          Daily revenue for the current month
        </p>
        <div className="h-60">
          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
