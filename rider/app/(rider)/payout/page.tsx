"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Textarea,
  Spinner,
  Chip,
  Select,
  SelectItem,
  addToast,
} from "@heroui/react";
import { RiderOrderService } from "@/services/RiderOrderService";
import { FiUploadCloud } from "react-icons/fi";
import dayjs from "dayjs";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

export default function RiderPayoutPage() {
  const [expected, setExpected] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Form states (currently hidden)
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

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

  const getDaysSinceLastRemit = () => {
    if (!history.length) return null;
    const lastDate = dayjs(history[0].remit_date);
    const today = dayjs();
    const diff = today.diff(lastDate, "day");
    return diff === 0 ? "Today" : `${diff} day${diff > 1 ? "s" : ""} ago`;
  };

  const applyFilter = () => {
    if (filter === "all") return history;
    const today = dayjs().format("YYYY-MM-DD");
    const now = dayjs();
    return history.filter((h) =>
      filter === "today"
        ? dayjs(h.remit_date).format("YYYY-MM-DD") === today
        : dayjs(h.remit_date).isAfter(now.startOf("week")) &&
          dayjs(h.remit_date).isBefore(now.endOf("week"))
    );
  };

  const filteredHistory = applyFilter();

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">

      {expected && (
        <Card className="shadow border">
          <CardHeader className="bg-primary text-white rounded-t-xl">
            <h3 className="font-semibold text-base">🧾 Expected Remittance</h3>
          </CardHeader>
          <CardBody className="text-sm space-y-1">
          <div className="grid grid-cols-[3fr_2fr] gap-4 items-center">
  {/* Left: Remittance details (60%) */}
  <div className="space-y-1 text-sm text-gray-700">
    <p>🧾 <span className="font-medium">Delivery Fees Collected:</span> ₱{expected.total_delivery_fees}</p>
    <p>💰 <span className="font-medium">Tips Received:</span> ₱{expected.total_tips}</p>
    <p className="text-green-700 font-semibold">
      ✅ Rider Share: ₱{expected.rider_share}
    </p>
    <p className="text-red-600 font-semibold">
      🚨 To Remit (10%): ₱{expected.expected_remittance}
    </p>
  </div>

  {/* Right: Illustration (40%) */}
  <div className="flex justify-end">
    <img
      src="/images/Wavy_Tech-28_Single-02.jpg"
      alt="Remittance Illustration"
      className="w-32 h-auto rounded-md "
    />
  </div>
</div>

  <details className="text-xs mt-2 text-blue-600 cursor-pointer">
    <summary>See breakdown</summary>
    <p className="mt-1">🧮 Expected = Delivery Fee × 10%</p>
    <p>🔹 90% of delivery fee goes to rider</p>
    <p>🔹 100% of tips go to rider</p>
  </details>
</CardBody>

        </Card>
      )}

      {/* Upload form (hidden for now) */}
      {false && (
        <Card className="border">
          <CardHeader className="bg-primary text-white rounded-t-xl">
            <h2 className="text-base font-semibold">📤 Submit Remittance</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <Input
              label="Amount Remitted (₱)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              placeholder="Enter amount"
              isRequired
            />
            <Textarea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any remarks?"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              label="Upload Proof of Payment"
              isRequired
            />
            <Button
              onPress={() => {}}
              color="primary"
              startContent={<FiUploadCloud />}
              isDisabled={loading}
            >
              Submit
            </Button>
          </CardBody>
        </Card>
      )}

      {/* History */}
      <Card className="shadow border">
        <CardHeader className="bg-primary text-white flex justify-between items-center rounded-t-xl">
          <h2 className="text-base font-semibold">📜 Remittance History</h2>
          <Select
            size="sm"
            selectedKeys={[filter]}
            onSelectionChange={(keys) => setFilter(Array.from(keys)[0] as string)}
            className="max-w-[150px] text-black"
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="today">Today</SelectItem>
            <SelectItem key="week">This Week</SelectItem>
          </Select>
        </CardHeader>
        <CardBody className="max-h-[60vh] overflow-y-auto space-y-4">
          {history.length > 0 && (
            <p className="text-sm text-gray-600 mb-2">
              🕒 Last remitted: {getDaysSinceLastRemit()}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : filteredHistory.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">No records found for this filter.</p>
          ) : (
            filteredHistory.map((item: any) => (
              <Card key={item.id} className="p-3 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="text-sm space-y-1 text-gray-700">
                    <p className="font-semibold">
                      🗓 {dayjs(item.remit_date).format("MMM D, YYYY")}
                    </p>
                    <p>
                      Remitted: ₱{item.amount} / Expected: ₱{item.expected_amount}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-gray-600">📝 {item.notes}</p>
                    )}
                    {item.short_reason && (
                      <p className="text-xs text-red-500">⚠️ {item.short_reason}</p>
                    )}
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

                  {item.proof_image && (
                    <PhotoProvider>
                      <PhotoView src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.proof_image}`}>
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.proof_image}`}
                          alt="proof"
                          className="w-24 h-16 object-cover rounded border cursor-pointer"
                        />
                      </PhotoView>
                    </PhotoProvider>
                  )}
                </div>
              </Card>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}