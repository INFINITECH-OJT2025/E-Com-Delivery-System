"use client";
import { useState } from "react";
import Image from "next/image";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/context/cartContext";
import AlertModal from "@/components/AlertModal"; // ✅ Import reusable alert modal

// ✅ Define Menu Item Props
interface MenuItemProps {
    menuItem: {
        id: number;
        name: string;
        price: number;
        description: string;
        image?: string;
        restaurant_id: number;
    };
}

export default function MenuItem({ menuItem }: MenuItemProps) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const imageUrl = menuItem.image ? `${API_URL}/storage/${menuItem.image}` : "/images/placeholder.png";
    
    const [isOpen, setIsOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // ✅ Add Loading State

    const { cart, addToCart, fetchCart, removeFromCart } = useCart();

    const handleOpen = () => {
        if (menuItem.availability === "out_of_stock") return; // Prevent modal opening
        setIsOpen(true);
    };

    const handleClose = () => setIsOpen(false);
    const increaseQuantity = () => setQuantity((prev) => prev + 1);
    const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = async () => {
        if (quantity < 1) return;
        setIsLoading(true); // ✅ Start Loading

        // ✅ Show warning if switching restaurants
        if (cart && cart.cart_items?.[0] && cart.restaurant_id !== menuItem.restaurant_id) {
            setIsWarningOpen(true);
            setIsLoading(false); // ✅ Stop loading if warning is triggered
            return;
        }

        const response = await addToCart(menuItem.id, quantity, menuItem.restaurant_id);
        if (!response.success) {
            alert(response.message || "Failed to add item to cart.");
            setIsLoading(false); // ✅ Stop Loading on failure
            return;
        }

        await fetchCart();
        setIsLoading(false); // ✅ Stop Loading on success
        handleClose();
    };

    return (
        <>
            {/* ✅ Menu Item Card - Disable click if unavailable */}
            <div 
                onClick={handleOpen}
                className={`relative flex items-center bg-white rounded-xl shadow-md overflow-hidden p-3 transition-all duration-300 
                        ${menuItem.availability === "out_of_stock" ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-1 hover:shadow-2xl cursor-pointer"} 
                        border border-gray-200`}
            >
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{menuItem.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{menuItem.description}</p>
                    <p className="text-sm font-bold text-primary mt-1">₱{menuItem.price}</p>
                </div>
                <div className="w-20 h-20 ml-3 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={imageUrl} alt={menuItem.name} width={80} height={80} className="object-cover w-full h-full" unoptimized />
                </div>

                {/* 🛑 Out of Stock Label */}
                {menuItem.availability === "out_of_stock" && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-bl-lg">
                        Out of Stock
                    </div>
                )}
            </div>

            {/* ✅ Modal */}
            <Modal isOpen={isOpen} onOpenChange={handleClose} placement="bottom" size="md">
                <ModalContent>
                    {/* ✅ Modal Header */}
                    <ModalHeader className="flex items-center justify-between p-3">
                        <h2 className="text-sm font-bold text-gray-900">{menuItem.name}</h2>
                    </ModalHeader>

                    {/* ✅ Modal Body */}
                    <ModalBody className="flex items-center p-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={imageUrl} alt={menuItem.name} width={96} height={96} className="object-cover w-full h-full" unoptimized />
                        </div>
                        <div className="flex-1 ml-4">
                            <p className="text-sm text-gray-700">{menuItem.description}</p>
                            <p className="text-lg font-semibold text-primary mt-2">₱{menuItem.price}</p>
                        </div>
                    </ModalBody>

                    {/* ✅ Footer */}
                    <ModalFooter className="flex items-center justify-between border-t p-3">
                        <div className="flex items-center gap-3">
                            <button onClick={decreaseQuantity} className="p-2 bg-gray-200 rounded-full">
                                <Minus className="w-4 h-4 text-gray-700" />
                            </button>
                            <span className="text-sm font-semibold">{quantity}</span>
                            <button onClick={increaseQuantity} className="p-2 bg-gray-200 rounded-full">
                                <Plus className="w-4 h-4 text-gray-700" />
                            </button>
                        </div>
                        <Button 
                            onPress={handleAddToCart} 
                            className="bg-primary text-white text-sm px-4 py-2"
                            isDisabled={isLoading} // ✅ Disable button while loading
                        >
                            {isLoading ? "Adding..." : "Add to Cart"} {/* ✅ Show Loading Text */}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ✅ Warning Modal for Switching Restaurants */}
            <AlertModal
                isOpen={isWarningOpen}
                onClose={() => {
                    setIsWarningOpen(false);
                    setIsLoading(false); // ✅ Reset Loading when modal is closed
                }}
                onConfirm={async () => {
                    setIsLoading(true); // ✅ Start Loading

                    for (const item of cart?.cart_items || []) {
                        await removeFromCart(item.id);
                    }

                    const response = await addToCart(menuItem.id, quantity, menuItem.restaurant_id);
                    await fetchCart();

                    setIsWarningOpen(false);
                    setIsLoading(false); // ✅ Stop Loading

                    if (!response.success) {
                        alert(response.message || "Failed to add item to cart.");
                    }
                }}
                title="Switching Restaurants"
                message="Your cart contains items from another restaurant. If you continue, your cart will be cleared."
                type="warning"
                confirmText={isLoading ? "Processing..." : "Proceed"} // ✅ Show loading state
                cancelText="Cancel"
            />
        </>
    );
}
