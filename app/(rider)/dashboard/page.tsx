"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RiderDashboardService } from "@/services/riderDashboardService";
import {
    Card, CardBody, CardHeader, CardFooter,
    Button, Badge,Chip, Divider, Spinner
  } from '@heroui/react';
  import { addToast } from "@heroui/react";
// import { IoFastFoodOutline, IoWalletOutline, IoNotificationsOutline, IoLocationOutline } from "react-icons/io5";
import {
    FaMapMarkerAlt,
    FaMotorcycle,
    FaWallet,
    FaBell,
  } from 'react-icons/fa';
  
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
      const earningsData = await RiderDashboardService.getEarnings();
      if (earningsData.success) setEarnings(parseFloat(earningsData.data.total_earnings));

      // ✅ Fetch Nearby Orders (Confirmed but Unassigned)
      const savedLocation = localStorage.getItem("rider_location");
      if (savedLocation) {
        const { address, lat, lng } = JSON.parse(savedLocation);
        
        // ✅ Make sure the UI reflects the saved address
        setCurrentLocation(address); 
        
        // ✅ Fetch nearby orders based on saved location
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
    const response = await RiderOrderService.getNearbyOrders(lat, lng);
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/*location */}
      <RiderAddressPicker onSelect={handleAddressSelect} />


          {/* Rider Profile */}
          <Card className="p-4 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
  <div className="flex items-center gap-4">
    <img
      src={rider?.profile_image || "/images/default-avatar.png"}
      alt="Profile"
      className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
    />
    <div>
      <h2 className="text-xl font-semibold">{rider?.name}</h2>
      <p className="text-sm opacity-80 uppercase">{rider?.vehicle_type}</p>
  
    </div>
  </div>
</Card>

  
   
          {/* Earnings Overview */}
          <Card className="shadow-lg">
            <CardBody className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Total Earnings</p>
                <h2 className="text-2xl font-bold text-primary">₱{earnings.toFixed(2)}</h2>
              </div>
              <FaWallet size={36} className="text-primary" />
            </CardBody>
          </Card>
  
          {/* Active Orders */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h3 className="flex items-center gap-2 font-semibold">
                <FaMotorcycle size={18} /> Active Orders
              </h3>
            </CardHeader>
            <Divider />
            <CardBody>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center">No active orders</p>
              ) : (
                orders.map((order: any) => (
                  <Card key={order.order_id} className="p-3 my-2 bg-gray-100 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Order #{order.order_id}</h4>
                        <p className="text-sm text-gray-500">📍 {order.restaurant_name}</p>
                        <p className="text-sm text-gray-500">🏠 {order.customer_address}</p>
                        <Chip color="primary" className="capitalize">{order.order_status.replace("_", " ")}</Chip>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => router.push(`/orders/${order.order_id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </CardBody>
          </Card>
  
          {/* Available Nearby Deliveries */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <h3 className="flex items-center gap-2 font-semibold">
                <FaMapMarkerAlt size={18} /> Available Nearby Deliveries
              </h3>
            </CardHeader>
            <Divider />
            <CardBody>
              {nearbyOrders.length === 0 ? (
                <p className="text-gray-500 text-center">No deliveries available nearby.</p>
              ) : (
                nearbyOrders.map((order: any) => (
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
  
          {/* Notifications */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <h3 className="flex items-center gap-2 font-semibold">
                <FaBell size={18} /> Notifications
              </h3>
            </CardHeader>
            <Divider />
            <CardBody>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center">No new notifications</p>
              ) : (
                notifications.slice(0, 3).map((notification: any) => (
                  <div key={notification.id} className="border-b py-2 last:border-none">
                    <p className="text-gray-700">{notification.message}</p>
                    <p className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
  
          {/* Address Picker Modal */}
          <RiderAddressPicker
            isOpen={locationModalOpen}
            onClose={() => setLocationModalOpen(false)}
            onSelect={handleAddressSelect}
          />
        </div>
      )}
    </div>
  );
}  