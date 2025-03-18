"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RiderOrderService } from "@/services/RiderOrderService";
import { Card,CardBody,CardHeader, Spinner, Button, Badge, Divider, addToast, Chip } from "@heroui/react";
import { IoFastFoodOutline, IoLocationOutline } from "react-icons/io5";
import {FaMapMarkerAlt,FaMotorcycle} from "react-icons/fa";
export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const isMounted = useRef(false); // Prevents duplicate fetching in dev mode

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchOrdersData();
    }
  }, []);

  const fetchOrdersData = async () => {
    setLoading(true);
    try {
      // ✅ Fetch Active Order
      const activeOrderData = await RiderOrderService.getAssignedOrders();
      if (activeOrderData.success && activeOrderData.data.length > 0) {
        setActiveOrder(activeOrderData.data[0]); // Use first assigned order
      } else {
        setActiveOrder(null); // No active orders
      }

      // ✅ Fetch Available Orders (Nearby unassigned)
      const savedLocation = localStorage.getItem("rider_location");
      if (savedLocation) {
        const { lat, lng } = JSON.parse(savedLocation);
        fetchNearbyOrders(lat, lng);
      }

      setLoading(false);
    } catch (error) {
      addToast({ title: "⚠️ Error", description: "Failed to load orders.", color: "danger" });
      setLoading(false);
    }
  };

  const fetchNearbyOrders = async (lat: number, lng: number) => {
    const response = await RiderOrderService.getNearbyOrders(lat, lng);
    if (response.success) {
      setAvailableOrders(response.data);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    const response = await RiderOrderService.acceptOrder(orderId);

    if (response.success) {
      addToast({
        title: "✅ Order Accepted",
        description: `You have successfully accepted Order #${orderId}.`,
        color: "success",
      });

      // ✅ Refresh the orders data after accepting
      fetchOrdersData();
    } else {
      addToast({
        title: "❌ Failed to Accept Order",
        description: response.message,
        color: "danger",
      });
    }
  };

  // Handle navigation to the route details page
  const handleViewRoute = (orderId: number) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
  
          {/* 🚀 Active Order */}
        
          <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h3 className="flex items-center gap-2 font-semibold">
              <FaMotorcycle size={18} /> Active Order
            </h3>
          </CardHeader>
          <Divider />
          <CardBody>
            {activeOrder ? (
              <Card className="p-3 my-2 bg-gray-100 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Order #{activeOrder.order_id}</h4>
                    <p className="text-sm text-gray-500">📍 {activeOrder.restaurant_name}</p>
                    <p className="text-sm text-gray-500">🏠 {activeOrder.customer_address}</p>
                    <Chip color="primary" className="capitalize">
                      {activeOrder.order_status.replace("_", " ")}
                    </Chip>
                  </div>
                  <Button
                    size="sm"
                    color="primary"
                    onPress={() => handleViewRoute(activeOrder.order_id)}
                  >
                    View
                  </Button>
                </div>
              </Card>
            ) : (
              <p className="text-gray-500 text-center">No active order.</p>
            )}
          </CardBody>
        </Card>
        
   
  
          {/* 🚀 Available Orders */}
          {/* Available Nearby Deliveries */}
                    <Card className="shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <h3 className="flex items-center gap-2 font-semibold">
                          <FaMapMarkerAlt size={18} /> Available Nearby Deliveries
                        </h3>
                      </CardHeader>
                      <Divider />
                      <CardBody>
                        {availableOrders.length === 0 ? (
                          <p className="text-gray-500 text-center">No deliveries available nearby.</p>
                        ) : (
                          availableOrders.map((order: any) => (
                            <Card key={order.order_id} className="p-3 my-2 bg-gray-100 shadow-sm">
                              <h4 className="font-semibold text-primary">Order #{order.order_id}</h4>
                              <p className="text-sm text-gray-500">📍 <strong>Pickup:</strong> {order.restaurant_name}</p>
                              <p className="text-sm text-gray-500">🏠 <strong>Dropoff:</strong> {order.customer_address}</p>
                              <p className="text-sm text-gray-500">📏 <strong>Distance:</strong> {order.restaurant_to_customer_distance.toFixed(2)} km</p>
                              <p className="text-sm text-gray-500">⏳ <strong>ETA:</strong> {order.estimated_delivery_time}</p>
            
                              <div className="bg-gray-200 p-2 rounded my-2">
                                <p className="text-sm font-semibold">🛒 Order Items:</p>
                                {order.items.map((item: any) => (
                                  <p key={item.menu_id} className="text-sm text-gray-600">
                                    {item.quantity}x {item.item_name} - ₱{item.subtotal}
                                  </p>
                                ))}
                              </div>
            
                              <div className="flex justify-between text-sm">
                                <span>Subtotal:</span><span>₱{order.subtotal}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Delivery Fee:</span><span>₱{order.delivery_fee}</span>
                              </div>
                              <div className="flex justify-between font-bold text-sm">
                                <span>Total Price:</span><span>₱{order.total_price}</span>
                              </div>
            
                              {order.order_status === "confirmed" ? (
                                <Button size="sm" color="primary" className="mt-2" onPress={() => handleAcceptOrder(order.order_id)}>
                                  Accept Order
                                </Button>
                              ) : (
                                <Badge color="warning" className="mt-2">Pending Approval</Badge>
                              )}
                            </Card>
                          ))
                        )}
                      </CardBody>
                    </Card>
  
        </div>
      )}
    </div>
  );
}  