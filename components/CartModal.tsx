"use client";
import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/cartContext";
import Image from "next/image";
import CheckoutModal from "@/components/CheckoutModal";

export default function CartModal({ isOpen, onClose }) {
    const { cart, removeFromCart, updateQuantity } = useCart();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // ✅ State to control Checkout Modal
    const [isCheckoutOpen, setCheckoutOpen] = useState(false);

    // ✅ Compute total price
    const totalPrice = cart?.cart_items?.reduce((acc, item) => acc + parseFloat(item.subtotal), 0) || 0;

    // ✅ Check if the restaurant is closed
    const isRestaurantClosed = cart?.restaurant_status === "closed";

    // ✅ Check if any item is out of stock
    const hasOutOfStockItems = cart?.cart_items?.some(item => item.menu.availability === "out_of_stock");


    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onClose} placement="bottom" size="full">
                <ModalContent>
                    {/* ✅ Modal Header */}
                    <ModalHeader className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                    </ModalHeader>

                    {/* ✅ Modal Body */}
                    <ModalBody className="p-4 h-[calc(100vh-140px)] overflow-y-auto">
                        {/* 🏬 Show Restaurant Name & Status */}
                        {cart?.restaurant_name && (
                            <div className={`text-md font-semibold mb-4 ${isRestaurantClosed ? "text-red-600" : "text-gray-700"}`}>
                                {cart.restaurant_name} {isRestaurantClosed && "(Closed)"}
                            </div>
                        )}

                        {/* 🛒 Cart Items */}
                        {cart?.cart_items?.length === 0 ? (
                            <p className="text-gray-500 text-center">Your cart is empty.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {cart?.cart_items?.map((item) => {
                                    const imageUrl = `${API_URL}/storage/${item.menu.image}`;
                                    const isOutOfStock =  item.menu.availability === "out_of_stock"; 

                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`flex items-center p-3 rounded-lg ${isOutOfStock ? "bg-red-100 border-red-500" : "bg-gray-100"}`}
                                        >
                                            {/* ✅ Image */}
                                            <Image 
                                                src={imageUrl} 
                                                alt={item.menu.name} 
                                                width={60} 
                                                height={60} 
                                                className="rounded-lg object-cover"
                                                unoptimized
                                            />

                                            {/* ✅ Menu Details */}
                                            <div className="flex-1 ml-3">
                                                <h3 className={`text-sm font-semibold ${isOutOfStock ? "text-red-600" : ""}`}>
                                                    {item.menu.name} {isOutOfStock && "(Out of Stock)"}
                                                </h3>
                                                <p className="text-xs text-gray-500">₱{item.price} x {item.quantity}</p>
                                            </div>

                                            {/* ✅ Quantity Controls (Disabled if out of stock) */}
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} 
                                                    className="p-2 bg-gray-200 rounded-full"
                                                    disabled={isOutOfStock}
                                                >
                                                    <Minus className="w-4 h-4 text-gray-700" />
                                                </button>
                                                <span className="text-sm font-semibold">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                                                    className="p-2 bg-gray-200 rounded-full"
                                                    disabled={isOutOfStock}
                                                >
                                                    <Plus className="w-4 h-4 text-gray-700" />
                                                </button>
                                            </div>

                                            {/* ✅ Remove Button */}
                                            <button 
                                                onClick={() => removeFromCart(item.id)} 
                                                className="ml-3 text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ModalBody>

                    {/* ✅ Modal Footer */}
                    <ModalFooter className="p-4 border-t bg-white shadow-lg flex flex-col gap-2">
                        {/* 🔥 Total Price */}
                        <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                            <span>Total</span>
                            <span>₱{totalPrice.toFixed(2)}</span>
                        </div>

                        {/* 🚀 Proceed to Checkout Button */}
                        <Button 
                            className="w-full bg-primary text-white text-md py-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            onPress={() => setCheckoutOpen(true)}
                            isDisabled={cart?.cart_items?.length === 0 || isRestaurantClosed || hasOutOfStockItems}
                        >
                            Proceed to Checkout
                        </Button>

                        {/* ⚠️ Warning Messages */}
                        {isRestaurantClosed && (
                            <p className="text-red-600 text-sm text-center">This restaurant is currently closed.</p>
                        )}
                        {hasOutOfStockItems && (
                            <p className="text-red-600 text-sm text-center">Some items are out of stock. Please remove them before checkout.</p>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ✅ Checkout Modal (Now Opens from Cart) */}
            <CheckoutModal 
                isOpen={isCheckoutOpen} 
                onClose={() => setCheckoutOpen(false)} 
            />
        </>
    );
}
