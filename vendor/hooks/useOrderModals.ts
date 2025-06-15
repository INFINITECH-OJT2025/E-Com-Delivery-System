// hooks/useOrderModals.ts
import { useState } from "react";
import { orderService } from "@/services/orderService";

export const useOrderModals = (refreshOrders: () => void) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const openViewModal = (order: any) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  const openConfirmModal = (order: any, status: string) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setConfirmModalOpen(true);
  };

  const openCancelModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus("canceled");
    setCancelModalOpen(true);
  };

  const updateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      refreshOrders();
      closeAllModals();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const cancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      await orderService.updateOrderStatus(selectedOrder.id, "canceled");
      refreshOrders();
      closeAllModals();
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  const closeAllModals = () => {
    setViewModalOpen(false);
    setConfirmModalOpen(false);
    setCancelModalOpen(false);
    setSelectedOrder(null);
  };

  return {
    selectedOrder,
    viewModalOpen,
    confirmModalOpen,
    cancelModalOpen,
    newStatus,
    openViewModal,
    openConfirmModal,
    openCancelModal,
    updateStatus,
    cancelOrder,
    closeAllModals,
  };
};
