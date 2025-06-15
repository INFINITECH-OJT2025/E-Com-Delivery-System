"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { MapPin, CreditCard, RotateCw, X, FileText, Star, Ticket } from "lucide-react";
import { capitalize, getRefundStatusColor } from "@/components/orders/OrderUtils";
import { orderService } from "@/services/orderService";
import ReviewModal from "@/components/orders/ReviewModal";
import { differenceInDays, parseISO } from "date-fns";

interface OrderDetailsProps {
  order: any;
  onBack: () => void;
  openRefundModal: (order: any) => void;
  fetchOrders: () => void;
  openAlert: (alert: any) => void;
}

export default function OrderDetails({ order, onBack, openRefundModal, fetchOrders, openAlert }: OrderDetailsProps) {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [zoomedImageOpen, setZoomedImageOpen] = useState(false);
/**
     * ✅ Handle Order Cancellation
     */
const handleCancelOrder = async () => {
  openAlert({
      isOpen: true,
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order?",
      onConfirm: async () => {
          const result = await orderService.cancelOrder(order.id);
          if (result.success) {
              openAlert({ isOpen: true, title: "Success", message: "Order canceled successfully!" });
              fetchOrders(); // ✅ Refresh the orders list
              onBack(); // ✅ Go back to the order list
          } else {
              openAlert({ isOpen: true, title: "Error", message: result.message });
          }
      },
  });
};
  const deliveredAt = order.ordered_at
    ? parseISO(order.ordered_at)
    : order.created_at
    ? parseISO(order.created_at)
    : null;

  const daysSinceDelivered = deliveredAt && !isNaN(deliveredAt.getTime())
    ? differenceInDays(new Date(), deliveredAt)
    : Infinity;

  const within7Days = daysSinceDelivered <= 7;
  const canRequestRefund = order.order_status === "completed" && !order.refund && within7Days;
  const canReview = order.order_status === "completed" && !order.review && within7Days;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
      <p className="text-sm text-gray-600">Ordered on {new Date(order.created_at).toLocaleString()}</p>

      {/* ✅ Restaurant Info */}
      <div className="flex items-center space-x-2">
        <MapPin className="w-5 h-5 text-blue-500" />
        <p className="text-lg font-semibold">{order.restaurant?.name || "Unknown Restaurant"}</p>
      </div>

      {/* ✅ Order Items */}
      <div className="border-t pt-3 space-y-2">
        {order.order_items.map((item: any) => (
          <OrderItem key={item.id} item={item} />
        ))}
      </div>

      {/* ✅ Voucher Info */}
      {(order.discount_on_subtotal > 0 || order.discount_on_shipping > 0) && (
        <div className="border-t pt-3 space-y-1">
          <p className="text-md font-semibold flex items-center">
            <Ticket className="w-5 h-5 mr-2 text-orange-500" /> Voucher Used
          </p>
          <p className="text-sm text-gray-600 ml-7">
            {order.voucher?.code ? (
              <>
                <strong className="text-gray-800">{order.voucher.code}</strong> ({order.voucher.type})
              </>
            ) : (
              <em className="text-gray-400">{order.voucher?.message || "Voucher applied but not recorded."}</em>
            )}
          </p>
        </div>
      )}

      {/* ✅ Order Summary */}
      <OrderSummary order={order} />

      {/* ✅ Proof of Delivery */}
      {order.delivery_proof && (
        <div className="border-t pt-3 space-y-2">
          <p className="text-md font-semibold flex items-center">
            <FileText className="w-5 h-5 text-green-600 mr-2" /> Proof of Delivery:
          </p>
          <img
            src={order.delivery_proof}
            alt="Proof of Delivery"
            onClick={() => setZoomedImageOpen(true)}
            className="w-full max-h-60 object-cover rounded-md border cursor-zoom-in transition-transform duration-200 hover:scale-105"
          />
        </div>
      )}

      {zoomedImageOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="relative">
            <button
              onClick={() => setZoomedImageOpen(false)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={order.delivery_proof}
              alt="Zoomed Proof"
              className="max-w-full max-h-screen rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

      {/* ✅ Refund Status */}
      {order.refund && (
        <div className="border-t pt-3">
          <p className="text-md font-semibold">Refund Status:</p>
          <p className={`text-sm font-bold ${getRefundStatusColor(order.refund.status)}`}>
            {capitalize(order.refund.status)}
          </p>
        </div>
      )}

      {/* ✅ Payment Info */}
      <div className="flex items-center space-x-2 text-gray-700">
        <CreditCard className="w-5 h-5" />
        <p>
          Paid with <span className="font-semibold">{order.payment?.payment_status === "success" ? order.payment?.payment_method : "Pending Payment"}</span>
        </p>
      </div>

      {/* ✅ Cancel Button */}
      {order.order_status === "pending" && (
        <Button className="w-full bg-red-500 text-white flex items-center justify-center" onPress={() => {
          openAlert({
            isOpen: true,
            title: "Cancel Order",
            message: "Are you sure you want to cancel this order?",
            onConfirm: handleCancelOrder,
          });
        }}>
          <X className="w-5 h-5 mr-2" />
          Cancel Order
        </Button>
      )}

      {canRequestRefund && (
        <Button className="w-full bg-yellow-500 text-white flex items-center justify-center" onPress={() => openRefundModal(order)}>
          <RotateCw className="w-5 h-5 mr-2" />
          Request Refund
        </Button>
      )}

      {canReview && (
        <Button className="w-full bg-blue-500 text-white flex items-center justify-center" onPress={() => setReviewModalOpen(true)}>
          <Star className="w-5 h-5 mr-2" />
          Add Review
        </Button>
      )}

      <Button variant="bordered" onPress={onBack} className="w-full">Back</Button>

      <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} order={order} openAlert={openAlert} onSubmitted={fetchOrders} />
    </div>
  );
}

/**
 * Order Item Component
 */
function OrderItem({ item }: { item: any }) {
  return (
    <div className="flex justify-between">
      <p className="text-gray-700">{item.quantity}x {item.name}</p>
      <p className="text-gray-900 font-semibold">₱{item.price.toFixed(2)}</p>
    </div>
  );
}

/**
 * Order Summary Component
 */
function OrderSummary({ order }: { order: any }) {
  return (
    <div className="border-t pt-3 space-y-1">
      <SummaryRow label="Subtotal" value={order.subtotal} />
      {order.discount_on_subtotal > 0 && <SummaryRow label="Discount on Subtotal" value={-order.discount_on_subtotal} />}
      {order.discount_on_shipping > 0 && <SummaryRow label="Discount on Shipping" value={-order.discount_on_shipping} />}
      <SummaryRow label="Delivery Fee" value={order.delivery_fee} />
      <SummaryRow label="Rider Tip" value={order.rider_tip} />
      <SummaryRow label="Total" value={order.total_price} isBold />
    </div>
  );
}

/**
 * Summary Row
 */
function SummaryRow({ label, value, isBold = false }: { label: string; value: number; isBold?: boolean }) {
  return (
    <div className={`flex justify-between ${isBold ? "font-semibold text-gray-900" : "text-gray-600"}`}>
      <p>{label}</p>
      <p className={value < 0 ? "text-green-600" : ""}>₱{Math.abs(value).toFixed(2)}</p>
    </div>
  );
}
