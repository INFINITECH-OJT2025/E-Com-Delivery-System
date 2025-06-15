"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Badge,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function NearbyOrdersCard({
  nearbyOrders,
  onAccept,
}: {
  nearbyOrders: any[];
  onAccept: (id: number) => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Render badges for "Far" and "Long ETA"
  const renderBadges = (order: any) => {
    const badges = [];
    if (order.restaurant_to_customer_distance > 5) {
      badges.push(
        <Badge key="far" color="danger" className="text-xs">
          Far
        </Badge>
      );
    }
    const etaNumbers = order.estimated_delivery_time.match(/\d+/g);
    const maxETA = etaNumbers ? Math.max(...etaNumbers.map(Number)) : 0;
    if (maxETA > 40) {
      badges.push(
        <Badge key="longETA" color="warning" className="text-xs">
          Long ETA
        </Badge>
      );
    }
    return badges;
  };

  // Calculate estimated payout as 90% of the delivery fee
  const estimatedPayout = (deliveryFee: number) => {
    return (deliveryFee * 0.9).toFixed(2);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-primary text-white rounded-t-2xl">
        <h3 className="flex items-center gap-2 font-semibold text-base">
          <FaMapMarkerAlt size={16} /> Available Nearby Deliveries
        </h3>
      </CardHeader>

      <CardBody className="space-y-3 p-4">
        {nearbyOrders.length === 0 ? (
          <p className="text-gray-500 text-center">
            No deliveries available nearby.
          </p>
        ) : (
          nearbyOrders.map((order) => (
            <div
              key={order.order_id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm flex justify-between items-center"
            >
              <div>
                <h4 className="font-medium text-primary text-sm">
                  Order #{order.order_id}
                </h4>
                <p className="text-xs text-gray-500 truncate max-w-[220px]">
                  {order.restaurant_name} → {order.customer_address.split(",")[0]}
                </p>
                <div className="flex gap-2 mt-1">
                  {renderBadges(order)}
                </div>
              </div>
              <Button
                size="sm"
                variant="light"
                className="text-xs font-medium"
                onPress={() => setSelectedOrder(order)}
              >
                View
              </Button>
            </div>
          ))
        )}
      </CardBody>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}  scrollBehavior="inside" hideCloseButton={true} isDismissable={false}>
        <ModalContent className="transition-all duration-300  ">
          {/* Header */}
          <ModalHeader className="bg-primary text-white rounded-t-xl flex justify-between items-center">
  <h3 className="text-base font-semibold flex items-center gap-2">
    📦 Order #{selectedOrder?.order_id}
  </h3>

  <button
    onClick={() => setSelectedOrder(null)}
    className="text-white text-sm font-medium hover:opacity-80 transition"
  >
    ✖
  </button>
</ModalHeader>

          <ModalBody className="space-y-4 py-4 px-5 text-sm text-gray-700">
            {selectedOrder && (
              <>
                {/* Pickup & Dropoff */}
                <div>
                  <p>
                    <span className="font-semibold">📍 Pickup:</span>{" "}
                    {selectedOrder.restaurant_name}
                  </p>
                  <p>
                    <span className="font-semibold">🏠 Dropoff:</span>{" "}
                    {selectedOrder.customer_address}
                  </p>
                </div>

                {/* Grouped Distance & ETA */}
                <div className="flex justify-between text-sm text-gray-600 border-y py-2">
                  <div className="flex items-center gap-1">
                    📏 <span>Distance:</span>
                    <strong className="ml-1">
                      {selectedOrder.restaurant_to_customer_distance.toFixed(2)} km
                    </strong>
                  </div>
                  <div className="flex items-center gap-1">
                    ⏱ <span>ETA:</span>{" "}
                    <strong className="ml-1">{selectedOrder.estimated_delivery_time}</strong>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-100 p-3 rounded-md">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    🛒 Order Items
                  </p>
                  <div className="space-y-1">
                    {selectedOrder.items.map((item: any) => (
                      <div key={item.menu_id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.item_name}
                        </span>
                        <span className="font-medium">₱{item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="space-y-1 text-sm pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₱{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₱{selectedOrder.delivery_fee}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t">
                    <span>Total Price</span>
                    <span>₱{selectedOrder.total_price}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t mt-1">
                    <span>Estimated Payout</span>
                    <span>₱{estimatedPayout(parseFloat(selectedOrder.delivery_fee))}</span>
                  </div>
                </div>
              </>
            )}
          </ModalBody>

          {/* Footer */}
          <ModalFooter className="px-5 pb-4">
            <Button variant="ghost" onPress={() => setSelectedOrder(null)}>
              Close
            </Button>
            {selectedOrder?.order_status === "confirmed" && (
              <Button
                color="primary"
                onPress={() => {
                  onAccept(selectedOrder.order_id);
                  setSelectedOrder(null);
                }}
              >
                Accept Order
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
}
