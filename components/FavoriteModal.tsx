"use client";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Spinner } from "@heroui/react"; // ✅ Imported Hero UI Spinner
import { useFavorite } from "@/context/favoriteContext"; // ✅ Ensure correct import
import RestaurantCard from "@/components/restaurantCard"; // ✅ Ensure correct import
import MenuItem from "@/components/MenuItem"; // ✅ Ensure correct import
import HorizontalScrollList from "@/components/horizontalScrollList"; // ✅ Import Horizontal Scroll List

interface FavoriteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FavoriteModal({ isOpen, onClose }: FavoriteModalProps) {
    const { favorites, fetchFavorites, similarRestaurants = [] } = useFavorite(); // ✅ Ensure default value for similarRestaurants
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetchFavorites().finally(() => setLoading(false)); // ✅ Ensures loading stops after fetch
        }
    }, [isOpen]);

    const handleCloseOnClick = () => {
        onClose(); // ✅ Closes modal when clicking any card
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="bottom" size="full">
            <ModalContent>
                {/* ✅ Header */}
                <ModalHeader className="flex justify-between items-center p-3 border-b">
                    <h2 className="text-md font-bold text-gray-900">Your Favorites</h2>
                </ModalHeader>

                {/* ✅ Body */}
                <ModalBody className="p-3 h-[calc(100vh-180px)] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Spinner size="lg" color="primary" /> {/* ✅ Hero UI Spinner */}
                        </div>
                    ) : favorites.length === 0 ? (
                        <p className="text-center text-gray-500">No favorites yet.</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {favorites.map((favorite) => {
                                    const isRestaurant = favorite.favoritable_type === "restaurant";
                                    const isDisabled = !favorite.is_open || !favorite.is_in_range; // ✅ Disable if closed or out of range

                                    return (
                                        <div key={favorite.id} className="relative">
                                            {/* ✅ Disable interaction if out of range or closed */}
                                            <div
                                                className={`relative ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
                                                onClick={!isDisabled ? handleCloseOnClick : undefined}
                                            >
                                                {/* ✅ Render RestaurantCard or MenuItem */}
                                                {isRestaurant ? (
                                                    <RestaurantCard 
                                                        restaurant={{
                                                            id: favorite.favoritable_id,
                                                            favoritable_id: favorite.favoritable_id,
                                                            slug: favorite.slug,
                                                            name: favorite.name,
                                                            banner_image: favorite.banner_image,
                                                            rating: favorite.rating,
                                                            total_reviews: favorite.total_reviews,
                                                            is_open: favorite.is_open,
                                                            distance_km: favorite.distance_km,
                                                            delivery_fee: favorite.delivery_fee ?? 0, // ✅ Ensures delivery_fee exists
                                                            estimated_time: favorite.estimated_time ?? "N/A", // ✅ Ensures estimated_time exists
                                                        }} 
                                                    />
                                                ) : (
                                                    <MenuItem menuItem={favorite} />
                                                )}
                                            </div>

                                            {/* ✅ Show Distance Warning (If Out of Range) */}
                                            {!favorite.is_in_range && (
                                                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md">
                                                    Out of Delivery Range
                                                </div>
                                            )}

                                            {/* ✅ Show Closed Overlay */}
                                            {!favorite.is_open && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs font-semibold">
                                                    Closed
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ✅ Similar Restaurants Section */}
                            {similarRestaurants.length > 0 && (
                                <div className="mt-6" onClick={handleCloseOnClick}>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        Similar Restaurants You May Like
                                    </h3>

                                    {/* ✅ Use Horizontal Scroll List for Similar Restaurants */}
                                    <HorizontalScrollList
                                        items={similarRestaurants.map((restaurant) => ({
                                            id: restaurant.restaurant_id,
                                            slug: restaurant.slug,
                                            name: restaurant.name,
                                            banner_image: restaurant.banner_image,
                                            is_open: restaurant.status === "open",
                                            rating: parseFloat(restaurant.rating), // ✅ Ensures decimal values stay intact
                                            total_reviews: 0, // If missing, default to 0
                                            delivery_fee: restaurant.delivery_fee ?? 0, // ✅ Ensures delivery_fee exists
                                            distance_km: restaurant.distance_km,
                                            estimated_time: restaurant.estimated_time ?? "N/A", // ✅ Ensures estimated_time exists
                                        }))}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
