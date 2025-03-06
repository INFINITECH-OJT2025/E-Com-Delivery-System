"use client";
import { useState } from "react";
import Image from "next/image";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { Minus, Plus, X } from "lucide-react";
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
    const [isWarningOpen, setIsWarningOpen] = useState(false); // ✅ Warning modal state
    const { cart, addToCart, fetchCart, removeFromCart } = useCart();

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const increaseQuantity = () => setQuantity((prev) => prev + 1);
    const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = async () => {
        if (quantity < 1) return;

        // ✅ Check if cart contains items from a different restaurant
        if (cart && cart.restaurant_id !== menuItem.restaurant_id) {
            setIsWarningOpen(true);
            return;
        }

        // ✅ Proceed with adding to cart
        const response = await addToCart(menuItem.id, quantity, menuItem.restaurant_id);
        if (!response.success) {
            alert(response.message || "Failed to add item to cart.");
            return;
        }

        await fetchCart();
        handleClose();
    };

    return (
        <>
            {/* ✅ Menu Item Card */}
            <div 
                onClick={handleOpen}
                className="relative flex items-center bg-white rounded-xl shadow-md overflow-hidden p-3 transform transition-all duration-300 
                        hover:-translate-y-1 hover:shadow-2xl cursor-pointer border border-gray-200"
            >
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{menuItem.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{menuItem.description}</p>
                    <p className="text-sm font-bold text-primary mt-1">₱{menuItem.price}</p>
                </div>
                <div className="w-20 h-20 ml-3 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={imageUrl} alt={menuItem.name} width={80} height={80} className="object-cover w-full h-full" unoptimized />
                </div>
            </div>

            {/* ✅ Modal */}
            <Modal isOpen={isOpen} onOpenChange={handleClose} placement="bottom" size="md">
                <ModalContent>
                    {/* ✅ Modal Header */}
                    <ModalHeader className="flex items-center justify-between p-3">
                        <h2 className="text-sm font-bold text-gray-900">{menuItem.name}</h2>
                        <button onClick={handleClose} className="p-2 bg-gray-100 rounded-full">
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
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
                        >
                            Add to Cart
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ✅ Warning Modal for Switching Restaurants */}
            <AlertModal
                isOpen={isWarningOpen}
                onClose={() => setIsWarningOpen(false)}
                onConfirm={async () => {
                    // ✅ Clear cart first
                    for (const item of cart?.cart_items || []) {
                        await removeFromCart(item.id);
                    }

                    // ✅ Add new item after clearing cart
                    await addToCart(menuItem.id, quantity, menuItem.restaurant_id);
                    await fetchCart();
                    setIsWarningOpen(false);
                }}
                title="Switching Restaurants"
                message="Your cart contains items from another restaurant. If you continue, your cart will be cleared."
                type="warning"
                confirmText="Proceed"
                cancelText="Cancel"
            />
        </>
    );
}
