"use client";
import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/cartContext";
import Image from "next/image";
import CheckoutModal from "@/components/CheckoutModal"; // ✅ Import CheckoutModal

export default function CartModal({ isOpen, onClose }) {
    const { cart, removeFromCart, updateQuantity } = useCart();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    // ✅ State to control Checkout Modal
    const [isCheckoutOpen, setCheckoutOpen] = useState(false);

    // ✅ Compute total price
    const totalPrice = cart?.cart_items?.reduce((acc, item) => acc + parseFloat(item.subtotal), 0) || 0;

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
                        {/* 🛒 Show Restaurant Name */}
                        {cart?.restaurant_name && (
                            <div className="text-gray-700 font-semibold text-md mb-4">
                                {cart.restaurant_name}
                            </div>
                        )}

                        {/* 🛒 Cart Items */}
                        {cart?.cart_items?.length === 0 ? (
                            <p className="text-gray-500 text-center">Your cart is empty.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {cart?.cart_items?.map((item) => {
                                    const imageUrl = `${API_URL}/storage/${item.menu.image}`;

                                    return (
                                        <div key={item.id} className="flex items-center bg-gray-100 p-3 rounded-lg">
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
                                                <h3 className="text-sm font-semibold">{item.menu.name}</h3>
                                                <p className="text-xs text-gray-500">₱{item.price} x {item.quantity}</p>
                                            </div>

                                            {/* ✅ Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} 
                                                    className="p-2 bg-gray-200 rounded-full"
                                                >
                                                    <Minus className="w-4 h-4 text-gray-700" />
                                                </button>
                                                <span className="text-sm font-semibold">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                                                    className="p-2 bg-gray-200 rounded-full"
                                                >
                                                    <Plus className="w-4 h-4 text-gray-700" />
                                                </button>
                                            </div>

                                            {/* ✅ Remove Button */}
                                            <button onClick={() => removeFromCart(item.id)} className="ml-3 text-red-600 hover:text-red-800">
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

                        {/* 🚀 Proceed to Checkout Button (Now Opens Checkout Modal) */}
                        <Button 
                            className="w-full bg-primary text-white text-md py-3"
                            onPress={() => setCheckoutOpen(true)}
                            disabled={cart?.cart_items?.length === 0}
                        >
                            Proceed to Checkout
                        </Button>
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
