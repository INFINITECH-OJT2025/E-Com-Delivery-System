"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Progress, Spinner } from "@heroui/react";
import { RiderAnalyticsService } from "@/services/riderAnalyticsService";

export default function CompletionRateCard() {
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    RiderAnalyticsService.getCompletionRate().then((res) => {
      if (res.success) {
        setRate(parseFloat(res.data.completion_rate));
      }
    });
  }, []);

  const getStatus = () => {
    if (rate === null) return "";
    if (rate >= 90) return "🚀 Excellent!";
    if (rate >= 75) return "👍 Good Job!";
    return "⚠️ Needs Improvement";
  };

  return (
    <Card className="shadow-lg border rounded-2xl overflow-hidden">
      <CardHeader className="bg-primary text-white px-4 py-3 text-base font-semibold">
        ✅ Completion Rate
      </CardHeader>

      <CardBody className="p-4">
        {rate === null ? (
          <div className="py-6 text-center">
            <Spinner size="sm" />
          </div>
        ) : (
          <>
            <Progress
              value={rate}
              color={rate >= 85 ? "success" : rate >= 70 ? "warning" : "danger"}
              className="h-3 rounded-full"
            />
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">{getStatus()}</span>
              <span className="font-semibold">{rate.toFixed(1)}%</span>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Your completion rate is based on the percentage of deliveries you accepted and successfully completed. 
              Higher completion rates build trust and can help you get more orders.
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
