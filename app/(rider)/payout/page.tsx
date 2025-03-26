"use client";

import { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, Input, Button, Textarea, Spinner, Chip, Select, SelectItem, addToast,
} from "@heroui/react";
import Image from "next/image";
import { FiUploadCloud } from "react-icons/fi";
import { RiderOrderService } from "@/services/RiderOrderService";
import dayjs from "dayjs";

export default function RiderPayoutPage() {
  const [expected, setExpected] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchExpected();
    fetchHistory();
  }, []);

  const fetchExpected = async () => {
    const res = await RiderOrderService.getTodayExpectedRemittance();
    if (res.status === "success") {
      setExpected(res.data);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    const res = await RiderOrderService.getRemittanceHistory();
    if (res.status === "success") {
      setHistory(res.data);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!file || !amount) {
      addToast({ title: "Missing Fields", description: "Amount and proof image are required", color: "danger" });
      return;
    }

    const response = await RiderOrderService.requestRemittance({
      amount,
      remit_date: expected?.since || new Date().toISOString().split("T")[0],
      file,
      notes,
    });

    if (response.status === "success") {
      addToast({
        title: "✅ Submitted",
        description: "Your remittance request has been submitted.",
        color: "success",
      });
      setAmount("");
      setNotes("");
      setFile(null);
      fetchHistory();
      fetchExpected();
    } else {
      addToast({
        title: "Error",
        description: response.message || "Failed to submit.",
        color: "danger",
      });
    }
  };

  const getDaysSinceLastRemit = () => {
    if (!history.length) return null;
    const lastDate = dayjs(history[0].remit_date);
    const today = dayjs();
    const diff = today.diff(lastDate, "day");
    return diff === 0 ? "Today" : `${diff} day${diff > 1 ? "s" : ""} ago`;
  };

  const applyFilter = () => {
    if (filter === "all") return history;
    if (filter === "today") {
      const today = dayjs().format("YYYY-MM-DD");
      return history.filter(h => dayjs(h.remit_date).format("YYYY-MM-DD") === today);
    }
    if (filter === "week") {
      const now = dayjs();
      return history.filter(h =>
        dayjs(h.remit_date).isAfter(now.startOf("week")) &&
        dayjs(h.remit_date).isBefore(now.endOf("week"))
      );
    }
    return history;
  };

  const filteredHistory = applyFilter();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-lg font-bold">💸 Rider Payout / Remittance</h1>

      {expected && (
        <Card className="bg-yellow-100">
          <CardBody>
            <p className="font-semibold mb-2">🧾 Expected Remittance (Since Last):</p>
            <ul className="text-sm space-y-1">
              <li>Delivery Fees Collected: ₱{expected.total_delivery_fees}</li>
              <li>Tips Received: ₱{expected.total_tips}</li>
              <li>Your Earnings (90% + Tips): ₱{expected.rider_share}</li>
              <li><strong className="text-red-600">To Remit (10%): ₱{expected.expected_remittance}</strong></li>
            </ul>
            <details className="text-xs mt-2 text-blue-600 cursor-pointer">
              <summary>See breakdown</summary>
              <p className="mt-1">🧮 Expected = Delivery Fee × 10%</p>
              <p>🔹 90% of delivery fee goes to rider</p>
              <p>🔹 100% of tips go to rider</p>
            </details>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-base font-semibold">📜 Remittance History</h2>
          <Select
            size="sm"
            selectedKeys={[filter]}
            onSelectionChange={(keys) => setFilter(Array.from(keys)[0] as string)}
            className="max-w-[180px] text-black"
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="today">Today</SelectItem>
            <SelectItem key="week">This Week</SelectItem>
          </Select>
        </CardHeader>
        <CardBody className="max-h-[60vh] overflow-y-auto">
          {history.length > 0 && (
            <p className="text-sm text-gray-600 mb-3">🕒 Last remitted: {getDaysSinceLastRemit()}</p>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item: any) => (
                <Card key={item.id}>
                  <CardBody className="space-y-1">
                    <div className="flex justify-between">
                      <span>🗓️ {dayjs(item.remit_date).format("MMM D, YYYY")}</span>
                      <Chip
                        color={
                          item.status === "completed"
                            ? "success"
                            : item.status === "pending"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                      >
                        {item.status}
                      </Chip>
                    </div>
                    <p>Remitted: ₱{item.amount} / Expected: ₱{item.expected_amount}</p>
                    {item.notes && <p className="text-sm text-gray-600">📝 {item.notes}</p>}
                    {item.short_reason && (
                      <p className="text-sm text-red-500">⚠️ {item.short_reason}</p>
                    )}
                    {item.proof_image && (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.proof_image}`}
                        alt="proof"
                        width={300}
                        height={200}
                        className="rounded mt-2 border"
                      />
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
