import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const RiderOrderService = {
  /**
   * ✅ Update Order Status
   */
  /**
   * ✅ Accept Order
   */
  async acceptOrder(orderId: number) {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized. Please log in." };

      const response = await axios.post(
        `${API_URL}/api/riders/orders/accept`,
        { order_id: orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        return { success: true, message: "Order accepted successfully.", order: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (error: any) {
      console.error("❌ Error accepting order:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Failed to accept order." };
    }
  },
  async getNearbyOrders(lat: number, lng: number) {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized" };

      const response = await axios.get(`${API_URL}/api/riders/nearby-orders`, {
        params: { lat, lng }, // ✅ Send location to fetch nearby orders
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        return { success: true, data: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Error fetching nearby orders:", error);
      return { success: false, message: "Failed to fetch nearby orders." };
    }
  },
  /**
   * ✅ Update Order Status
   */
  async updateOrderStatus(orderId: number, status: string) {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized. Please log in." };

      const response = await axios.post(
        `${API_URL}/api/riders/orders/update`,
        { order_id: orderId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        return { success: true, message: "Order status updated." };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      return { success: false, message: "Failed to update order status." };
    }
  },  async getAssignedOrders() {
      try {
        const token = localStorage.getItem("riderToken");
        if (!token) return { success: false, message: "Unauthorized" };
  
        const response = await axios.get(`${API_URL}/api/riders/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.data.status === "success") {
          return { success: true, data: response.data.data };
        }
        return { success: false, message: response.data.message };
      } catch (error) {
        console.error("Error fetching assigned orders:", error);
        return { success: false, message: "Failed to fetch orders." };
      }
    },
  /**
   * ✅ Fetch order details including pickup & drop-off locations
   * @param orderId - The ID of the order
   */
  async getOrderDetails(orderId: number) {
    try {
      const token = localStorage.getItem("riderToken");
      if (!token) return { success: false, message: "Unauthorized" };

      const response = await axios.get(`${API_URL}/api/riders/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === "success") {
        return { success: true, data: response.data.data };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error("Error fetching order details:", error);
      return { success: false, message: "Failed to fetch order details." };
    }
  },
  
  /**
   * ✅ Upload Proof of Delivery (Image)
   */
  async uploadProofOfDelivery(deliveryId: number, file: File) {
    try {
      const formData = new FormData();
      formData.append("order_id", deliveryId.toString());
      formData.append("proof_image", file);

      const token = localStorage.getItem("riderToken");
      const response = await axios.post(
        `${API_URL}/api/riders/deliveries/upload-proof`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      if (response.data.status === "success") {
        return { success: true, message: "Proof uploaded successfully!", imageUrl: response.data.image_url };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("❌ Error uploading proof:", error);
      return { success: false, message: "Failed to upload proof." };
    }
  },
  /**
 * ✅ Send Rider Location Update (using order_id)
 */
async updateRiderLocation(orderId: number, lat: number, lng: number) {
  try {
    const token = localStorage.getItem("riderToken");
    if (!token) {
      return { success: false, message: "Unauthorized. Please log in." };
    }

    const response = await axios.post(
      `${API_URL}/api/riders/location`,
      {
        order_id: orderId, // ✅ order_id instead of delivery_id
        current_lat: lat,
        current_lng: lng,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.status === "success") {
      return { success: true, message: "Location updated successfully." };
    }

    return { success: false, message: response.data.message };
  } catch (error: any) {
    console.error("❌ Error updating rider location:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update rider location.",
    };
  }
},
async getDeliveryHistory() {
  const token = localStorage.getItem("riderToken");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rider/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return data;
},


// ✅ Get today's expected remittance
async getTodayExpectedRemittance() {
  const token = localStorage.getItem("riderToken");
  const res = await fetch(`${API_URL}/api/rider/remittance/today`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
},

// ✅ Submit remittance
async requestRemittance(payload: {
  amount: string;
  remit_date: string;
  file: File;
  notes?: string;
}) {
  const token = localStorage.getItem("riderToken");
  const formData = new FormData();

  formData.append("amount", payload.amount);
  formData.append("remit_date", payload.remit_date);
  formData.append("proof_image", payload.file);
  if (payload.notes) formData.append("notes", payload.notes);

  const res = await fetch(`${API_URL}/api/rider/remittance/request`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return await res.json();
},

// ✅ Remittance history
async getRemittanceHistory() {
  const token = localStorage.getItem("riderToken");
  const res = await fetch(`${API_URL}/api/rider/remittance/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
},
};
