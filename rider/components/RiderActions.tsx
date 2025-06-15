"use client";
import { useState } from "react";
import { RiderOrderService } from "@/services/RiderOrderService";
import { useParams } from "next/navigation";
import { Button, Alert } from "@heroui/react";

const RiderActions = () => {
  const { orderId } = useParams();
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState(null);

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const response = await RiderOrderService.updateOrderStatus(orderId, newStatus);
      if (response.status === "success") {
        setStatus(newStatus);
        setMessage(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {message && <Alert variant="success">{message}</Alert>}
      <Button variant="primary" onClick={() => updateOrderStatus("picked_up")}>
        Mark as Picked Up
      </Button>
      <Button variant="secondary" onClick={() => updateOrderStatus("delivered")}>
        Mark as Delivered
      </Button>
    </div>
  );
};

export default RiderActions;
