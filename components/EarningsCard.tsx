"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { FaWallet } from "react-icons/fa";

export default function EarningsCard({ earnings }: { earnings: number }) {
  return (
    <Card className="shadow-lg border rounded-xl">
      {/* Colored Header */}
      <CardHeader className="bg-primary text-white rounded-t-xl flex items-center justify-between px-4 py-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <FaWallet className="text-white" /> Total Earnings
        </h3>
      </CardHeader>

      {/* Body */}
      <CardBody className="px-4 py-6 text-center">
        <p className="text-3xl font-bold text-primary">
          ₱{earnings.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          This reflects your total completed deliveries earnings.
        </p>
      </CardBody>
    </Card>
  );
}
