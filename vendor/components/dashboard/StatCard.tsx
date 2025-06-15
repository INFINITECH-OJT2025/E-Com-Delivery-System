"use client";

import { Card, CardBody } from "@heroui/react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendColor: string;
  iconBg?: string;
  iconColor?: string;
  isPositive?: boolean;
}

export default function StatCard({
  icon,
  label,
  value,
  trend,
  trendColor,
  iconBg = "bg-gray-100",
  iconColor = "text-gray-500",
}: StatCardProps) {
  return (
    <Card className="shadow-sm border">
      <CardBody className="relative p-5">
        {/* Icon top right */}
        <div
          className={`absolute top-4 right-4 rounded-full p-2 ${iconBg} ${iconColor} text-lg`}
        >
          {icon}
        </div>

        {/* Content */}
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-xs mt-1 ${trendColor}`}>{trend}</p>
      </CardBody>
    </Card>
  );
}
