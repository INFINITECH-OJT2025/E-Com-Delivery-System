"use client";

import { Scanner } from "@yudiel/react-qr-scanner";

interface QRScannerProps {
  visible: boolean;
  onScan: (value: string) => void;
}

export default function QRScanner({ visible, onScan }: QRScannerProps) {
  if (!visible) return null;

  return (
    <div className="rounded-md border p-2 shadow mt-4 max-w-md mx-auto">
      <Scanner
        onScan={(result) => onScan(result[0]?.rawValue || "")}
        onError={(err) => console.error("QR scan error", err)}
        styles={{
          container: { width: "100%" },
          video: { borderRadius: "0.5rem", width: "100%", aspectRatio: "1/1" },
        }}
        constraints={{ facingMode: "environment" }}
      />
    </div>
  );
}
