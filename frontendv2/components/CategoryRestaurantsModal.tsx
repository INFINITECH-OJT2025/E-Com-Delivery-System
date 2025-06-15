"use client";

import { useState, useEffect, useMemo } from "react";
import { homeService } from "@/services/homeService";
import { useUser } from "@/context/userContext";
import { IoChevronForwardOutline } from "react-icons/io5";
import LocationBar from "@/components/LocationBar";
import FilterComponent from "@/components/filterComponent";
import SearchBar from "@/components/SearchBar";
import Deals from "@/components/deals";
import Categories from "@/components/categories";
import RestaurantCard from "@/components/restaurantCard";
import RestaurantModal from "@/components/restaurantModal";
import CategoryRestaurantsModal from "@/components/CategoryRestaurantsModal"; // ✅ Import new modal
import HorizontalScrollList from "@/components/horizontalScrollList";
import CircleScrollList from "@/components/circleScrollList";
import { Spinner } from "@heroui/react";
import ActiveOrderTracker from "@/components/ActiveOrderTracker";

export default function HomePage() {
    const { selectedAddress, fetchUser } = useUser();
    const [data, setData] = useState({
        promos: [],
        categories: [],
        order_again: [],
        top_restaurants: [],
        fast_delivery: [],
        explore_restaurants: []
    });

    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [pendingOrder, setPendingOrder] = useState(null);
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
    const [categoryModal, setCategoryModal] = useState({ isOpen: false, category: "" }); // ✅ New state for category modal
    
    useEffect(() => {
        async function fetchData() {
            if (!selectedAddress) {
                setLoading(true);
                await fetchUser();
                return;
            }

            setLoading(true);
            try {
                const { latitude, longitude } = selectedAddress || getStoredAddress();

                if (!latitude || !longitude) {
                    setError("Location not found. Please set your address or refresh the page.");
                    setLoading(false);
                    return;
                }

                const response = await homeService.fetchHomeData(latitude, longitude, filters);
                if (!response.success || !response.data) throw new Error(response.message || "Invalid home data response");

                setData(response.data);

                const pendingResponse = await homeService.getPendingOrder();
                setPendingOrder(pendingResponse.success ? pendingResponse.data : null);
            } catch (err) {
                console.error("API Error:", err.message);
                setError("Failed to load homepage data.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedAddress, filters]);

    function getStoredAddress() {
        const stored = localStorage.getItem("selected_address");
        return stored ? JSON.parse(stored) : { latitude: null, longitude: null };
    }

    const filteredRestaurants = useMemo(() => {
        return Array.isArray(data?.explore_restaurants) ? data.explore_restaurants : [];
    }, [data?.explore_restaurants, filters]);

    if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

    return (
        <div className="w-full h-screen flex flex-col bg-white">
            <div className="">
                <LocationBar />
                <SearchBar />
                <FilterComponent
                    selectedFilters={filters}
                    categories={data.categories}
                    onApplyFilters={setFilters}
                />

                <div className="px-3 md:px-6">
                    {/* ✅ Categories Section */}
                    {data.categories?.length > 0 && (
                        <>
                            <h2 className="text-sm font-bold mt-4 mb-2 md:text-base">Your Favorite Cuisines</h2>
                            <div className="flex gap-2 overflow-x-auto">
                                {data.categories.map((category) => (
                                    <button
                                        key={category.id}
                                        className="bg-gray-100 px-4 py-2 rounded-full text-sm hover:bg-primary hover:text-white transition"
                                        onClick={() => setCategoryModal({ isOpen: true, category: category.name })} // ✅ Open modal
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ✅ Explore Restaurants Section */}
                    {filteredRestaurants.length > 0 ? (
                        <div className="mt-5">
                            <h2 className="text-sm font-bold mt-4 mb-2 md:text-base">Explore Restaurants</h2>
                            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {filteredRestaurants.map((restaurant) => (
                                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500">
                            <p className="text-lg font-semibold">No restaurants available in your area.</p>
                            <p className="text-sm text-gray-600">Try searching in another location.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ Modal for Category-Based Restaurants */}
            <CategoryRestaurantsModal
                isOpen={categoryModal.isOpen}
                category={categoryModal.category}
                restaurants={data.explore_restaurants}
                onClose={() => setCategoryModal({ isOpen: false, category: "" })}
            />

            {/* ✅ Active Order Tracker */}
            <div className="relative pb-14">
                <ActiveOrderTracker />
            </div>
        </div>
    );
}
