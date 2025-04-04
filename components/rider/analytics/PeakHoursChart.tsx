"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { RiderAnalyticsService } from "@/services/riderAnalyticsService";

const formatHour = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour} ${period}`;
};

export default function PeakHoursChart() {
  const [data, setData] = useState<{ hour: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    RiderAnalyticsService.getPeakHours().then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <Card className="shadow-lg border rounded-2xl overflow-hidden">
      <CardHeader className="bg-primary text-white px-4 py-3 text-base font-semibold">
        ⏰ Peak Delivery Hours
      </CardHeader>

      <CardBody className="p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="sm" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No data available yet.</p>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={formatHour}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: any) => [`${value} orders`, "Orders"]}
                    labelFormatter={(label: number) => `Hour: ${formatHour(label)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              These are the hours when most deliveries occur. Use this data to plan your shifts around high-demand times and boost your earnings potential.
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
