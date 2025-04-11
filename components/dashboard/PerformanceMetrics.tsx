"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { FaClock, FaBox, FaPercent, FaTruck } from "react-icons/fa";
import { DashboardService } from "@/services/dashboardService";

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      const res = await DashboardService.getPerformanceMetrics();
      setMetrics(res);
      setLoading(false);
    }

    fetchMetrics();
  }, []);

  return (
    <Card className="shadow-sm border h-full">
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Performance Metrics</h3>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading performance...</p>
        ) : (
          <>
            {/* Top Progress Bars */}
            <div className="space-y-4">
              {[
                { label: "Order Acceptance Rate", value: metrics.acceptanceRate },
                { label: "On-Time Delivery Rate", value: metrics.onTimeDelivery },
                { label: "Customer Satisfaction", value: metrics.satisfaction },
                {
                  label: "Order Preparation Time",
                  value: 100,
                  suffix: `${metrics.avgPrepTime} min avg.`,
                },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>{metric.label}</span>
                    <span>
                      {metric.value}
                      {metric.suffix ? "" : "%"}
                      {metric.suffix && (
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          ({metric.suffix})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded mt-1">
                    <div
                      className="bg-green-500 h-2 rounded"
                      style={{ width: `${Math.min(metric.value, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Summary Cards with Styled Icons */}
            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              <div className="bg-blue-50 p-3 rounded flex items-center gap-3">
                <div className="bg-blue-200 text-blue-800 p-2 rounded-full">
                  <FaClock className="text-sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Avg. Preparation</p>
                  <p className="font-semibold">{metrics.avgPrepTime} minutes</p>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded flex items-center gap-3">
                <div className="bg-purple-200 text-purple-800 p-2 rounded-full">
                  <FaTruck className="text-sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Avg. Delivery</p>
                  <p className="font-semibold">{metrics.avgDeliveryTime} minutes</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded flex items-center gap-3">
                <div className="bg-yellow-200 text-yellow-800 p-2 rounded-full">
                  <FaBox className="text-sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Completed Orders</p>
                  <p className="font-semibold">
                    {metrics.completedOrders.toLocaleString()} this month
                  </p>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded flex items-center gap-3">
                <div className="bg-red-200 text-red-800 p-2 rounded-full">
                  <FaPercent className="text-sm" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cancellation Rate</p>
                  <p className="font-semibold">
                    {metrics.cancellationRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
