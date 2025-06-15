"use client";

import { orderService } from "@/services/orderService";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import Image from "next/image";
import {
  FaCheck,
  FaTimes,
  FaClipboardCheck,
  FaClock,
  FaPhone,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-200 text-yellow-800",
  confirmed: "bg-blue-200 text-blue-800",
  preparing: "bg-purple-200 text-purple-800",
  out_for_delivery: "bg-orange-200 text-orange-800",
  completed: "bg-green-200 text-green-800",
  canceled: "bg-red-200 text-red-800",
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Order Received", icon: "📥" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "🧑‍🍳" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🛵" },
  { key: "completed", label: "Delivered", icon: "📦" },
];

interface OrderModalProps {
  selectedOrder: {
    id: number;
    order_status: string;
    created_at: string;
    order_items: { id: number; quantity: number; name: string; subtotal: number }[];
    subtotal: number;
    payment?: { payment_method?: string; payment_status?: string };
    delivery_proof?: string;
    delivery_status?: string;
    delivered_at?: string;
    customer?: { id: number; name?: string; phone_number?: string; email?: string };
    customer_address?: { address?: string };
  } | null;
  viewModalOpen: boolean;
  closeAllModals: () => void;
  openConfirmModal: (order: any, status: string) => void;
  openCancelModal: (order: any) => void;
}

export default function OrderModal({
  selectedOrder,
  viewModalOpen,
  closeAllModals,
  openConfirmModal,
  openCancelModal,
}: OrderModalProps) {
  if (!selectedOrder) return null;

  const currentStepIndex = TIMELINE_STEPS.findIndex(
    (s) => s.key === selectedOrder.order_status
  );

  return (
    <Modal isOpen={viewModalOpen} onOpenChange={closeAllModals} size="sm" scrollBehavior="inside" isDismissable={false}>
      <ModalContent className="max-w-6xl mx-auto">
        <ModalHeader className="text-2xl font-bold border-b pb-4">
          Order ORD-{selectedOrder.id}
          <Chip
            className={`ml-4 px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[selectedOrder.order_status] || "bg-gray-300 text-gray-800"}`}
          >
            {selectedOrder.order_status}
          </Chip>
        </ModalHeader>

        <ModalBody className="p-6">
          <Tabs aria-label="Order Details Tabs" fullWidth>
            {/* Tab 1 - Details */}
            <Tab key="details" title="Order Details">
  <div className="space-y-6 text-sm text-gray-700">
    {/* 🧾 Order Summary */}
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="flex justify-between items-center border-b px-4 py-3">
        <h3 className="font-semibold text-base">Order Summary</h3>
        <p className="text-xs text-gray-500">
          <FaClock className="inline-block mr-1" />
          {new Date(selectedOrder.created_at).toLocaleString()}
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* Items */}
        {selectedOrder.order_items.map((item) => (
          <div key={item.id} className="flex justify-between items-start">
            <div>
              <p className="font-medium">{item.quantity}× {item.name}</p>
            </div>
            <p className="text-right font-medium text-gray-800">₱{item.subtotal}</p>
          </div>
        ))}

        {/* Totals */}
        <div className="border-t pt-3 mt-2">
          <div className="flex justify-between font-semibold text-base">
            <span>Subtotal</span>
            <span>₱{selectedOrder.subtotal}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="flex items-center gap-2 pt-3 text-sm text-gray-600">
          <span>💳 Payment:</span>
          <span className="font-medium capitalize">
            {selectedOrder.payment?.payment_method || "N/A"}
          </span>
          {/* <span
            className={`text-sm font-semibold ${
              selectedOrder.payment?.payment_status === "success"
                ? "text-green-600"
                : "text-yellow-600"
            }`}
          >
            {selectedOrder.payment?.payment_status === "success" ? "• Paid" : "• Pending"}
          </span> */}
        </div>
      </div>
    </div>

    {/* 🖼️ Proof of Delivery (if exists) */}
    {selectedOrder.delivery_proof && (
      <div>
        <h3 className="font-semibold mb-2">Proof of Delivery</h3>
        <PhotoProvider>
          <PhotoView src={selectedOrder.delivery_proof}>
            <img
              src={selectedOrder.delivery_proof}
              alt="Proof of Delivery"
              className="w-32 h-20 rounded object-cover border cursor-zoom-in"
            />
          </PhotoView>
        </PhotoProvider>
      </div>
    )}
  </div>
</Tab>


            {/* Tab 2 - Timeline */}
            <Tab key="timeline" title="Timeline">
  <div className="space-y-6">
    <p className="font-semibold text-gray-700 text-center">Order Timeline</p>

    <div className="relative max-w-2xl mx-auto">
      {/* Center vertical line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200" />

      <div className="space-y-12">
        {TIMELINE_STEPS.map((step, index) => {
         const isCompleted =
         index < currentStepIndex ||
         (step.key === "completed" && selectedOrder.delivery_status === "delivered");
       
       const isCurrent =
         index === currentStepIndex &&
         !(step.key === "completed" && selectedOrder.delivery_status === "delivered");
       

          const timestamp =
            step.key === "pending"
              ? selectedOrder.created_at
              : step.key === "completed"
              ? selectedOrder.delivered_at
              : null;

          const alignment = index % 2 === 0 ? "left" : "right";

          return (
            <div
              key={step.key}
              className={`relative flex items-center justify-between ${
                alignment === "left" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Content Box */}
              <div
                className={`bg-white shadow-md rounded-lg px-4 py-3 w-[calc(50%-1.5rem)] ${
                  isCompleted
                    ? "border-l-4 border-green-500"
                    : isCurrent
                    ? "border-l-4 border-blue-500"
                    : "border-l-4 border-gray-300"
                }`}
              >
                <h3
                  className={`font-semibold ${
                    isCompleted ? "text-green-700" : isCurrent ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </h3>
                {timestamp && (
                  <p className="text-xs text-gray-400">{new Date(timestamp).toLocaleString()}</p>
                )}
                {isCurrent && step.key !== "completed" && (
                  <p className="text-xs text-gray-400 italic">In progress</p>
                )}
              </div>

              {/* Dot icon in center */}
              <div
  className={`z-10 absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
    ${isCompleted
      ? "bg-green-500 text-white"
      : isCurrent
      ? "bg-white border-2 border-blue-500 text-blue-500"
      : "bg-gray-300 text-gray-500"}
  `}
>
  {step.icon}
</div>

            </div>
          );
        })}
      </div>
    </div>
  </div>
</Tab>


            {/* Tab 3 - Customer Info */}
            <Tab key="customer" title="Customer Info">
  <div className="space-y-6">
    {/* Header Section */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 p-4 rounded-lg">
      <div>
        <p className="text-lg font-semibold text-gray-800">
          {selectedOrder.customer?.name || "Unnamed Customer"}
        </p>
        <p className="text-sm text-gray-500">Customer ID: CUST-{selectedOrder.customer?.id}</p>
      </div>
      <div className="mt-3 sm:mt-0 flex gap-2">
        {selectedOrder.customer?.phone_number && (
          <a
            href={`tel:${selectedOrder.customer.phone_number}`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            📞 Call
          </a>
        )}
        {selectedOrder.customer?.email && (
          <a
            href={`mailto:${selectedOrder.customer.email}`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            💬 Email
          </a>
        )}
      </div>
    </div>

    {/* Contact Information Card */}
    <div className="bg-gray-50 rounded-lg p-4 space-y-4 text-sm text-gray-700">
      {selectedOrder.customer?.phone_number && (
        <div className="flex items-center gap-2">
          <FaPhone className="text-gray-500" />
          <a href={`tel:${selectedOrder.customer.phone_number}`} className="hover:underline">
            {selectedOrder.customer.phone_number}
          </a>
        </div>
      )}
      {selectedOrder.customer?.email && (
        <div className="flex items-center gap-2">
          <FaEnvelope className="text-gray-500" />
          <a href={`mailto:${selectedOrder.customer.email}`} className="hover:underline">
            {selectedOrder.customer.email}
          </a>
        </div>
      )}
      {selectedOrder.customer_address?.address && (
        <div className="flex items-start gap-2">
          <FaMapMarkerAlt className="text-gray-500 mt-0.5" />
          <p>{selectedOrder.customer_address.address}</p>
        </div>
      )}
    </div>
  </div>
</Tab>

          </Tabs>

          {/* Action Footer */}
          <div className="flex justify-end gap-3 mt-6">
            {selectedOrder.order_status === "pending" && (
              <>
                <Button
                  color="warning"
                  onPress={() => openConfirmModal(selectedOrder, "confirmed")}
                >
                  <FaCheck className="mr-2" /> Confirm
                </Button>
                <Button color="danger" onPress={() => openCancelModal(selectedOrder)}>
                  <FaTimes className="mr-2" /> Cancel
                </Button>
              </>
            )}
            {selectedOrder.order_status === "confirmed" && (
             <Button
             color="success"
             onPress={async () => {
               if (selectedOrder && selectedOrder.id) { // <-- double check id is there
                 await orderService.updateOrderStatus(selectedOrder.id, "preparing");
                 closeAllModals();
                 window.location.reload(); // ✅ Force full page reload
                } else {
                 console.error("Selected order ID is missing!");
               }
             }}
           >
             <FaClipboardCheck className="mr-2" /> Mark as Preparing
           </Button>
           
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="bordered" size="lg" onPress={closeAllModals}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
