"use client";

import { useEffect, useState } from "react";
import { Spinner, addToast, Tabs, Tab } from "@heroui/react";

// Components
import RiderAddressPicker from "@/components/RiderAddressPicker";
import RiderProfileCard from "@/components/RiderProfileCard";
import EarningsCard from "@/components/EarningsCard";
import ActiveOrdersCard from "@/components/ActiveOrdersCard";
import NearbyOrdersCard from "@/components/NearbyOrdersCard";
import NotificationsCard from "@/components/NotificationsCard";
import EditProfileModal from "@/components/rider/settings/EditProfileModal";

// Analytics
import TopZonesMapHeatmap from "@/components/rider/analytics/TopZonesChart";
import PeakHoursChart from "@/components/rider/analytics/PeakHoursChart";
import CompletionRateCard from "@/components/rider/analytics/CompletionRateCard";
import EarningsTrendChart from "@/components/rider/analytics/EarningsTrendChart";

// Services
import { RiderDashboardService } from "@/services/riderDashboardService";
import { RiderOrderService } from "@/services/RiderOrderService";

export default function RiderDashboard() {
  const [loading, setLoading] = useState(true);
  const [rider, setRider] = useState<any>(null);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [nearbyOrders, setNearbyOrders] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("Fetching location...");
  const [showEditModal, setShowEditModal] = useState(false);

  // Separate functions for specific data parts

  const fetchProfile = async () => {
    const profileData = await RiderDashboardService.getProfile();
    if (profileData.success) {
      setRider(profileData.data);
    }
  };

  const fetchAssignedOrders = async () => {
    const assignedOrders = await RiderOrderService.getAssignedOrders();
    if (assignedOrders.success) {
      setOrders(assignedOrders.data);
    }
  };

  const fetchEarnings = async () => {
    const earningsData = await RiderDashboardService.getEarnings();
    if (earningsData.success) {
      setEarnings(parseFloat(earningsData.data.total_earnings));
    }
  };

  const fetchNearbyOrders = async (lat: number, lng: number) => {
    const response = await RiderOrderService.getNearbyOrders(lat, lng);
    if (response.success) {
      setNearbyOrders(response.data);
    }
  };

  // Full refresh function used only on mount
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProfile(), fetchAssignedOrders(), fetchEarnings()]);
      const savedLocation = localStorage.getItem("rider_location");
      if (savedLocation) {
        const { address, lat, lng } = JSON.parse(savedLocation);
        setCurrentLocation(address);
        fetchNearbyOrders(lat, lng);
      }
    } catch (error) {
      addToast({
        title: "⚠️ Error",
        description: "Failed to load dashboard data.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setCurrentLocation(address);
    localStorage.setItem("rider_location", JSON.stringify({ address, lat, lng }));
    fetchNearbyOrders(lat, lng);
    window.dispatchEvent(new CustomEvent("locationUpdated"));
    addToast({
      title: "📍 Location Updated",
      description: `New location set: ${address}`,
      color: "success",
    });
  };

  const handleAcceptOrder = async (orderId: number) => {
    const response = await RiderOrderService.acceptOrder(orderId);
    if (response.success) {
      addToast({
        title: "✅ Order Accepted",
        description: `You have successfully accepted Order #${orderId}.`,
        color: "success",
      });
      // Only refresh active and nearby orders:
      await Promise.all([fetchAssignedOrders()]);
      const savedLocation = localStorage.getItem("rider_location");
      if (savedLocation) {
        const { lat, lng } = JSON.parse(savedLocation);
        fetchNearbyOrders(lat, lng);
      }
    } else {
      addToast({
        title: "❌ Failed to Accept Order",
        description: response.message,
        color: "danger",
      });
    }
  };

  const handleEditProfile = () => setShowEditModal(true);

  // Partial update after profile edit
  const handleProfileUpdate = (updatedRiderData: any) => {
    setRider((prev: any) => ({ ...prev, ...updatedRiderData }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Location Picker + Profile */}
          <RiderAddressPicker onSelect={handleAddressSelect} />
          <RiderProfileCard rider={rider} onEdit={handleEditProfile} />
          <EarningsCard earnings={earnings} />

          {/* Tabs for organized content */}
          <Tabs fullWidth variant="solid" color="primary">
            <Tab title="📋 Orders">
              <div className="space-y-4 mt-4">
                <ActiveOrdersCard orders={orders} />
                <NearbyOrdersCard nearbyOrders={nearbyOrders} onAccept={handleAcceptOrder} />
              </div>
            </Tab>

            <Tab title="📊 Analytics">
              <div className="space-y-4">
                <TopZonesMapHeatmap />
                <PeakHoursChart />
                <CompletionRateCard />
                <EarningsTrendChart />
              </div>
            </Tab>

            {/* <Tab title="🔔 Notifications">
              <div className="space-y-4">
                <NotificationsCard notifications={notifications} />
              </div>
            </Tab> */}
          </Tabs>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        rider={rider}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}
