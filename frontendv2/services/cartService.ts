"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api";
import { apiHelper } from "@/libs/apiHelper";

export const cartService = {
    /**
 * ✅ Fetch the user's cart (with auth token & stored address)
 */
async fetchCart() {
    const token = localStorage.getItem("auth_token");
    if (!token) return { success: false, message: "Unauthorized" };

    try {
        // ✅ Get latitude & longitude from selected address (stored in UserContext)
        const selectedAddress = localStorage.getItem("selected_address");
        if (!selectedAddress) return { success: false, message: "No selected address found" };

        let latitude, longitude;
        try {
            const addressData = JSON.parse(selectedAddress);
            latitude = addressData?.latitude;
            longitude = addressData?.longitude;
        } catch (error) {
            console.error("Error parsing selected_address:", error);
            return { success: false, message: "Invalid address format" };
        }

        // ✅ Fetch cart with location validation
        const res = await fetch(`${API_URL}/api/cart?lat=${latitude}&lng=${longitude}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        return await apiHelper.handleResponse(res);
    } catch (error) {
        console.error("Error fetching cart:", error);
        return { success: false, message: "Failed to fetch cart" };
    }
}
,

    /**
     * ✅ Add an item to the cart
     */
    async addToCart(menu_id: number, quantity: number, restaurant_id: number) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/cart`, { // ✅ Fixed URL
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ menu_id, quantity, restaurant_id }),
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error adding to cart:", error);
            return { success: false, message: "Failed to add item to cart" };
        }
    },

    /**
     * ✅ Update cart item quantity
     */
    async updateCartItem(item_id: number, quantity: number) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/cart/${item_id}`, { // ✅ Fixed URL
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ quantity }),
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error updating cart item:", error);
            return { success: false, message: "Failed to update cart item" };
        }
    },

    /**
     * ✅ Remove item from cart
     */
    async removeFromCart(item_id: number) {
        const token = localStorage.getItem("auth_token");
        if (!token) return { success: false, message: "Unauthorized" };

        try {
            const res = await fetch(`${API_URL}/api/cart/${item_id}`, { // ✅ Fixed URL
                method: "DELETE",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            return await apiHelper.handleResponse(res);
        } catch (error) {
            console.error("Error removing cart item:", error);
            return { success: false, message: "Failed to remove item from cart" };
        }
    },
};
