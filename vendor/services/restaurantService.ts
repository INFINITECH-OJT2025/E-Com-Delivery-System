import axios from "axios";

// Define the Restaurant type
interface Restaurant {
  name?: string;
  slug?: string;
  description?: string;
  address?: string;
  phone_number?: string;
  status?: string;
  service_type?: string;
  minimum_order_for_delivery?: number;
  restaurant_category_id?: number | null;
}

// Define the API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/vendor";

// Restaurant details service
export const RestaurantService = {
  // Fetch restaurant details
  async getRestaurantDetails() {
    try {
      const response = await axios.get(`${API_URL}/api/vendor/restaurant/details`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("vendorToken")}`,
          "Content-Type": "application/json",
        },
      });
      return response.data; // Return the restaurant data
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
      throw new Error("Failed to fetch restaurant details.");
    }
  },

 // Update restaurant details (including files)
async updateRestaurantDetails(data: Partial<Restaurant>, logoFile: File | null, bannerFile: File | null) {
  try {
    const formData = new FormData();

    // Ensure all values are defined before appending
    formData.append("name", data.name || "");
    formData.append("slug", data.slug || "");
    formData.append("description", data.description || "");
    formData.append("address", data.address || "");
    formData.append("phone_number", data.phone_number || "");
    formData.append("status", data.status || "open");
    formData.append("service_type", data.service_type || "both");
    formData.append("minimum_order_for_delivery", String(data.minimum_order_for_delivery || 0));

    // ✅ Append category info
    if (data.restaurant_category_id !== null && data.restaurant_category_id !== undefined) {
      formData.append("restaurant_category_id", String(data.restaurant_category_id));
    } else if (data.custom_category_name) {
      formData.append("custom_category_name", data.custom_category_name);
    }

    // ✅ Append JSON fields
    if (data.custom_schedule_json) {
      formData.append("custom_schedule_json", JSON.stringify(data.custom_schedule_json));
    }
    if (typeof data.visibility !== "undefined") {
      formData.append("visibility", data.visibility ? "1" : "0");
    }

    // ✅ Append files
    if (logoFile) formData.append("logo", logoFile);
    if (bannerFile) formData.append("banner_image", bannerFile);

    const response = await axios.post(`${API_URL}/api/vendor/restaurant/details`, formData, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("vendorToken")}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating restaurant details:", error);
    throw new Error("Failed to update restaurant details.");
  }
}
,
  
  // Fetch restaurant categories
  async getCategories() {
    try {
      const response = await axios.get(`${API_URL}/api/vendor/restaurant/categories`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("vendorToken")}`,
          "Content-Type": "application/json",
        },
      });
      return response.data; // Return the categories data
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories.");
    }
  },
};
