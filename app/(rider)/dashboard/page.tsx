"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RiderDashboardService } from "@/services/riderDashboardService";
import { 
  Card, CardBody, Spinner, Button, Badge, Divider, addToast 
} from "@heroui/react";
import { IoFastFoodOutline, IoWalletOutline, IoNotificationsOutline, IoLocationOutline } from "react-icons/io5";
import RiderAddressPicker from "@/components/RiderAddressPicker"; // ✅ Import Address Picker
import {RiderOrderService} from "@/services/RiderOrderService";
export default function RiderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rider, setRider] = useState<any>(null);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [nearbyOrders, setNearbyOrders] = useState([]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Fetching location...");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const profileData = await RiderDashboardService.getProfile();
      if (profileData.success) setRider(profileData.data);
  
      // ✅ Fetch Assigned Orders (Orders already accepted by the rider)
      const assignedOrdersData = await RiderOrderService.getAssignedOrders();
      if (assignedOrdersData.success) setOrders(assignedOrdersData.data);
  
      // ✅ Fetch Nearby Orders (Confirmed but Unassigned)
      if (localStorage.getItem("rider_location")) {
        const { lat, lng } = JSON.parse(localStorage.getItem("rider_location") || "{}");
        fetchNearbyOrders(lat, lng);
      }
  
      setLoading(false);
    } catch (error) {
      addToast({ title: "⚠️ Error", description: "Failed to load dashboard data.", color: "danger" });
      setLoading(false);
    }
  };
  
  const handleAcceptOrder = async (orderId: number) => {
    const response = await RiderOrderService.acceptOrder(orderId);
  
    if (response.success) {
      addToast({ 
        title: "✅ Order Accepted", 
        description: `You have successfully accepted Order #${orderId}.`, 
        color: "success" 
      });
  
      // ✅ Refresh Both Assigned & Nearby Orders
      fetchDashboardData();
    } else {
      addToast({ 
        title: "❌ Failed to Accept Order", 
        description: response.message, 
        color: "danger" 
      });
    }
  };
  
  
  
  // ✅ Fetch Nearby Orders based on location
  const fetchNearbyOrders = async (lat: number, lng: number) => {
    const response = await RiderDashboardService.getNearbyOrders(lat, lng);
    if (response.success) setNearbyOrders(response.data);
  };

  // ✅ Handle Address Selection
  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setCurrentLocation(address);
    localStorage.setItem("rider_location", JSON.stringify({ address, lat, lng }));
    fetchNearbyOrders(lat, lng);
    addToast({ title: "📍 Location Updated", description: `New location set: ${address}`, color: "success" });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* 🚀 Rider Profile Section */}
          <Card className="p-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <img
                src={rider?.profile_image || "/images/default-avatar.png"}
                alt="Profile"
                className="w-16 h-16 rounded-full border"
              />
              <div>
                <h2 className="text-xl font-semibold">{rider?.name}</h2>
                <p className="text-gray-500">{rider?.vehicle_type.toUpperCase()}</p>
                <Badge color={rider?.rider_status === "approved" ? "success" : "warning"}>
                  {rider?.rider_status}
                </Badge>
              </div>
            </div>
          </Card>

          {/* 📍 Location Selection */}
          <Card className="p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <IoLocationOutline className="mr-2 text-secondary" size={20} />
                  Current Location
                </h3>
                <p className="text-sm text-gray-500">{currentLocation}</p>
              </div>
              <Button color="primary" onPress={() => setLocationModalOpen(true)}>Set Location</Button>
            </div>
          </Card>

          {/* 🚀 Earnings Overview */}
          <Card className="p-4 shadow-lg bg-white">
            <CardBody className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Total Earnings</p>
                <h2 className="text-2xl font-bold text-primary">₱{earnings.toFixed(2)}</h2>
              </div>
              <IoWalletOutline size={40} className="text-primary" />
            </CardBody>
          </Card>

          {/* 🚀 Active Orders Section */}
          {/* 🚀 Active Orders Section */}
<Card className="p-4 shadow-lg">
  <h3 className="text-lg font-semibold flex items-center">
    <IoFastFoodOutline className="mr-2 text-secondary" size={20} />
    Active Orders
  </h3>
  <Divider />
  {orders.length === 0 ? (
    <p className="text-gray-500 text-center py-4">No active orders</p>
  ) : (
    orders.map((order: any) => (
      <Card key={order.order_id} className="p-3 mt-2 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-semibold">Order #{order.order_id}</h4>
            <p className="text-sm text-gray-500">📍 {order.restaurant_name}</p>
            <p className="text-sm text-gray-500">🏠 {order.customer_address}</p>
            <Badge color="primary">{order.order_status.replace("_", " ")}</Badge>
          </div>
          <Button
            size="sm"
            color="primary"
            onClick={() => router.push(`/riders/orders/${order.order_id}`)}
          >
            View
          </Button>
        </div>
      </Card>
    ))
  )}
</Card>


    {/* 🚀 Nearby Orders (Available for Pickup) */}
<Card className="p-4 shadow-lg">
  <h3 className="text-lg font-semibold flex items-center">
    <IoLocationOutline className="mr-2 text-secondary" size={20} />
    Available Deliveries Near You
  </h3>
  <Divider />
  {nearbyOrders.length === 0 ? (
    <p className="text-gray-500 text-center py-4">No deliveries available nearby.</p>
  ) : (
    nearbyOrders.map((order: any) => (
      <Card key={order.order_id} className="p-3 mt-2 bg-gray-50">
        <div className="flex flex-col space-y-2">
          <h4 className="font-semibold text-primary">Order #{order.order_id}</h4>
          <p className="text-sm text-gray-500">📍 <strong>Pickup:</strong> {order.restaurant_name}</p>
          <p className="text-sm text-gray-500">🏠 <strong>Dropoff:</strong> {order.customer_address}</p>
          <p className="text-sm text-gray-500">📏 <strong>Distance:</strong> {order.restaurant_to_customer_distance.toFixed(2)} km</p>
          <p className="text-sm text-gray-500">⏳ <strong>ETA:</strong> {order.estimated_delivery_time}</p>

          {/* Order Summary */}
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-sm font-semibold">🛒 Order Items:</p>
            {order.items.map((item: any) => (
              <p key={item.menu_id} className="text-sm text-gray-600">
                {item.quantity}x {item.item_name} - ₱{item.subtotal}
              </p>
            ))}
          </div>

          {/* Pricing Details */}
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>₱{order.subtotal}</span>
          </div>
          {order.promo && (
            <div className="flex justify-between text-sm text-green-500">
              <span>Discount ({order.promo.code}):</span>
              <span>-₱{order.promo.discount_amount || (order.promo.discount_percentage + "%")}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Delivery Fee:</span>
            <span>₱{order.delivery_fee}</span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span>Total Price:</span>
            <span>₱{order.total_price}</span>
          </div>

          {/* Accept Order Button - Only Show if Order is "Confirmed" */}
          {order.order_status === "confirmed" ? (
            <Button
              size="sm"
              color="primary"
              className="mt-2"
              onClick={() => handleAcceptOrder(order.order_id)}
            >
              Accept Order
            </Button>
          ) : (
            <Badge color="warning" className="mt-2">Pending Approval</Badge>
          )}
        </div>
      </Card>
    ))
  )}
</Card>


          {/* 🚀 Notifications Section */}
          <Card className="p-4 shadow-lg">
            <h3 className="text-lg font-semibold flex items-center">
              <IoNotificationsOutline className="mr-2 text-secondary" size={20} />
              Notifications
            </h3>
            <Divider />
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No new notifications</p>
            ) : (
              notifications.slice(0, 3).map((notification: any) => (
                <div key={notification.id} className="border-b py-2 last:border-none">
                  <p className="text-gray-700">{notification.message}</p>
                  <p className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </Card>

          {/* 📍 Address Picker Modal */}
          <RiderAddressPicker isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} onSelect={handleAddressSelect} />

        </div>
      )}
    </div>
  );
}
