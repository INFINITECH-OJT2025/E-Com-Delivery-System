// hooks/useQRScanner.ts
import { useState } from "react";
import { addToast } from "@heroui/react";

export const useQRScanner = (orders: any[], onOrderFound: (order: any) => void) => {
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [qrInput, setQrInput] = useState<string>("");

  const toggleScanner = () => setShowScanner((prev) => !prev);

  const handleQRScan = (raw: string) => {
    const matched = raw.match(/(\d+)/);
    const scannedId = matched ? parseInt(matched[1]) : NaN;
    findOrderById(scannedId);
  };

  const manualSearch = () => {
    const manualId = parseInt(qrInput);
    findOrderById(manualId);
  };

  const findOrderById = (id: number) => {
    const found = orders.find((order) => order.id === id);
    if (found) {
      onOrderFound(found);
      setShowScanner(false);
    } else {
      addToast({
        title: "Order not found",
        description: "Check your ID and try again.",
        color: "danger",
      });
    }
  };

  return {
    showScanner,
    qrInput,
    setQrInput,
    toggleScanner,
    handleQRScan,
    manualSearch,
  };
};
