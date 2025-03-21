'use client';

import React, { useEffect, useState } from 'react';
import { homeService } from '@/services/homeService';

const PendingOrder = () => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map Delivery Status to Order Status
  const getOrderStatusMessage = (orderStatus: string, deliveryStatus: string | null) => {
    const statusMessages: Record<string, string> = {
      pending: "📌 Please wait for the store to confirm your order.",
      preparing: "⏳ Order confirmed! The store is preparing your items.",
      out_for_delivery: "🚴 Your order is on the way!",
      completed: "✅ Your order has been delivered!",
    };

    // Handle cases when deliveryStatus is still null
    if (!deliveryStatus || deliveryStatus === "null") {
      return orderStatus === "pending"
        ? statusMessages["pending"]
        : "✔️ Order confirmed, waiting for a rider to be assigned.";
    }

    // Map Delivery Status to Order Status
    const orderStatusMap: Record<string, string> = {
      assigned: "preparing",
      arrived_at_vendor: "preparing",
      picked_up: "out_for_delivery",
      in_delivery: "out_for_delivery",
      arrived_at_customer: "out_for_delivery",
      photo_uploaded: "completed",
      delivered: "completed",
    };

    return statusMessages[orderStatusMap[deliveryStatus] || orderStatus] || "📦 Order processing...";
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await homeService.getPendingOrder();
console.log(response)
        if (response.success  && response.data) {
          setOrder(response.data);
        } else if (response.message === 'Unauthorized') {
          setError('❌ Please log in to view your orders.');
        } else if (response.message === 'No active orders found') {
          setError('ℹ️ You have no active orders at the moment.');
        } else {
          setError('⚠️ No pending orders available.');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('🚨 Unable to check your orders at this time.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  if (loading) {
    return <div className="bg-yellow-100 text-yellow-800 p-2 rounded">🔄 Checking your pending orders...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-800 p-3 rounded">{error}</div>;
  }

  return (
    <div className="bg-green-100 text-green-800 p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold">🚀 Active Order Details</h2>
      <p><strong>🛒 Order from:</strong> {order.restaurant_location.name}</p>
      <p><strong>📌 Order ID:</strong> #{order.order_id}</p>
      <p><strong>🔄 Order Status:</strong> {order.order_status}</p>
      <p><strong>🚦 Delivery Status:</strong> {order.delivery_status || 'Not Assigned Yet'}</p>

      <div className="mt-3">
        <h3 className="text-md font-semibold">📍 Customer Location</h3>
        <p>{order.customer_location.address}</p>
      </div>

      <div className="mt-3">
        <h3 className="text-md font-semibold">🏢 Restaurant Info</h3>
        <p><strong>Name:</strong> {order.restaurant_location.name}</p>
        <p><strong>Address:</strong> {order.restaurant_location.address}</p>
        <p><strong>Phone:</strong> {order.restaurant_location.phone}</p>
      </div>

      <div className="mt-3">
        <h3 className="text-md font-semibold">🛵 Rider Info</h3>
        {order.rider.name ? (
          <>
            <p><strong>Name:</strong> {order.rider.name}</p>
            <p><strong>Phone:</strong> {order.rider.phone}</p>
            <img src={order.rider.profile_image} alt="Rider Profile" className="w-16 h-16 rounded-full mt-2" />
          </>
        ) : (
          <p>🚴 No rider assigned yet.</p>
        )}
      </div>

      <div className="mt-3 p-3 bg-white text-gray-800 rounded-md shadow-md">
        <h3 className="text-md font-semibold">ℹ️ Order Update</h3>
        <p>{getOrderStatusMessage(order.order_status, order.delivery_status)}</p>
      </div>
    </div>
  );
};

export default PendingOrder;
