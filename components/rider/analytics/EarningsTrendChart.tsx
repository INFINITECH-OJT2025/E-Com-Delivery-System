"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { RiderAnalyticsService } from "@/services/riderAnalyticsService";

export default function EarningsTrendChart() {
  const [data, setData] = useState<{ date: string; earnings: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    RiderAnalyticsService.getEarningsTrend().then((res) => {
      if (res.success) {
        const formatted = res.data.map((item: any) => ({
          date: item.date,
          earnings: parseFloat(item.total),
        }));
        setData(formatted);
      }
      setLoading(false);
    });
  }, []);

  return (
    <Card className="shadow-lg border rounded-2xl overflow-hidden">
      <CardHeader className="bg-primary text-white px-4 py-3 text-base font-semibold">
        📈 Earnings Trend
      </CardHeader>

      <CardBody className="p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="sm" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No earnings data available.</p>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `₱${val}`} />
                  <Tooltip
                    formatter={(value: number) => [`₱${value.toFixed(2)}`, "Earnings"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10B981"
                    fill="#A7F3D0"
                    strokeWidth={2}
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Monitor your recent earnings performance to spot trends, busy days, or low-income periods. Use this insight to plan your working hours smartly.
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
