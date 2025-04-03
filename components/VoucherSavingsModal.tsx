"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Select,
  SelectItem,
} from "@heroui/react";
import { voucherService } from "@/services/voucherService";

interface VoucherSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Usage {
  promo_code: string;
  type: string;
  saved_amount: number;
  used_at: string;
  details: {
    before_discount: number;
    after_discount: number;
    max_possible_discount: number;
  };
}

export default function VoucherSavingsModal({
  isOpen,
  onClose,
}: VoucherSavingsModalProps) {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"today" | "month" | "all">("today");
  const [allUsages, setAllUsages] = useState<Usage[]>([]);
  const [filteredUsages, setFilteredUsages] = useState<Usage[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    if (isOpen) fetchVoucherSavings();
  }, [isOpen]);

  useEffect(() => {
    applyFilter();
  }, [filter, allUsages]);

  const fetchVoucherSavings = async () => {
    setLoading(true);
    const res = await voucherService.getVoucherSavings();
    if (res.success) {
      const usages = res.data.usages.map((u: any) => ({
        ...u,
        saved_amount: parseFloat(u.saved_amount),
      }));
      setAllUsages(usages);
    } else {
      console.error("Error:", res.message);
    }
    setLoading(false);
  };

  const applyFilter = () => {
    const now = new Date();
    let filtered = allUsages;

    if (filter === "today") {
      filtered = allUsages.filter((u) => {
        const used = new Date(u.used_at);
        return (
          used.getDate() === now.getDate() &&
          used.getMonth() === now.getMonth() &&
          used.getFullYear() === now.getFullYear()
        );
      });
    } else if (filter === "month") {
      filtered = allUsages.filter((u) => {
        const used = new Date(u.used_at);
        return (
          used.getMonth() === now.getMonth() &&
          used.getFullYear() === now.getFullYear()
        );
      });
    }

    setFilteredUsages(filtered);

    const total = filtered.reduce(
      (acc, curr) => acc + curr.saved_amount,
      0
    );
    setTotalSaved(total);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="text-lg font-bold text-gray-800">
          Voucher Usage Summary
        </ModalHeader>

        <ModalBody className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <p className="text-green-600 text-lg font-semibold">
                  🎉 Congratulations!
                </p>
                <p className="text-gray-700 text-sm">
                  You saved a total of:
                </p>
                <p className="text-3xl font-bold text-green-600">
                  ₱{totalSaved.toFixed(2)}
                </p>
              </div>

              <div className="flex justify-end">
                <Select
                  size="sm"
                  variant="flat"
                  defaultSelectedKeys={new Set(["today"])} // ✅ This ensures "Today" is selected by default
                  onSelectionChange={(key) =>
                    setFilter(key as "today" | "month" | "all")
                  }
                  className="w-32"
                >
                  <SelectItem key="today">Today</SelectItem>
                  <SelectItem key="month">This Month</SelectItem>
                  <SelectItem key="all">All Time</SelectItem>
                </Select>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-3 border-t pt-2">
                {filteredUsages.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">
                    No voucher usage for selected range.
                  </p>
                ) : (
                  filteredUsages.map((usage, index) => (
                    <div
                      key={index}
                      className="border p-3 rounded-md bg-gray-50"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-semibold text-gray-800">
                          {usage.promo_code}{" "}
                          <span className="text-xs font-normal text-gray-500">
                            ({usage.type})
                          </span>
                        </p>
                        <p className="text-green-600 font-semibold">
                          ₱{usage.saved_amount.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Used at: {new Date(usage.used_at).toLocaleString()}
                      </p>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>
                          <strong>Before:</strong> ₱
                          {usage.details.before_discount.toFixed(2)}
                        </p>
                        <p>
                          <strong>After:</strong> ₱
                          {usage.details.after_discount.toFixed(2)}
                        </p>
                        <p>
                          <strong>Max Possible Discount:</strong> ₱
                          {usage.details.max_possible_discount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
