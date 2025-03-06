"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { cartService } from "@/services/cartService";

interface CartItem {
    id: number;
    menu_id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface Cart {
    id: number;
    user_id: number;
    restaurant_id: number;
    restaurant_name: string; // ✅ Store restaurant name
    cart_items: CartItem[];
}

interface CartContextType {
    cart: Cart | null;
    fetchCart: () => void;
    addToCart: (menu_id: number, quantity: number, restaurant_id: number) => Promise<{ success: boolean; message?: string }>;
    removeFromCart: (item_id: number) => Promise<{ success: boolean; message?: string }>;
    updateQuantity: (item_id: number, quantity: number) => Promise<{ success: boolean; message?: string }>;
    removeAllCart: () => Promise<{ success: boolean; message?: string }>; // ✅ New function to clear cart
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);

    // ✅ Fetch Cart (Only if user is authenticated)
    const fetchCart = async () => {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        const response = await cartService.fetchCart();
        if (response.success) {
            setCart(response.data || null); // ✅ Store full cart data
        } else {
            console.error("Failed to fetch cart:", response.message);
        }
    };

    // ✅ Add to Cart
    const addToCart = async (menu_id: number, quantity: number, restaurant_id: number) => {
        const response = await cartService.addToCart(menu_id, quantity, restaurant_id);
        if (response.success) {
            await fetchCart();
        } else {
            console.error("Error adding to cart:", response.message);
        }
        return response;
    };

    // ✅ Update Cart Item Quantity
    const updateQuantity = async (item_id: number, quantity: number) => {
        const response = await cartService.updateCartItem(item_id, quantity);
        if (response.success) {
            await fetchCart();
        } else {
            console.error("Error updating cart item:", response.message);
        }
        return response;
    };

    // ✅ Remove from Cart
    const removeFromCart = async (item_id: number) => {
        const response = await cartService.removeFromCart(item_id);
        if (response.success) {
            await fetchCart();
        } else {
            console.error("Error removing cart item:", response.message);
        }
        return response;
    };

    // ✅ Clear Cart (Remove All Items)
    const removeAllCart = async () => {
        const response = await cartService.clearCart();
        if (response.success) {
            setCart(null); // ✅ Reset cart to empty state
        } else {
            console.error("Error clearing cart:", response.message);
        }
        return response;
    };

    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <CartContext.Provider value={{ cart, fetchCart, addToCart, removeFromCart, updateQuantity, removeAllCart }}>
            {children}
        </CartContext.Provider>
    );
}

// ✅ Ensure Context is Not `null`
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
