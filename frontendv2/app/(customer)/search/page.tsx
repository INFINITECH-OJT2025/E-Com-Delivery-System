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
import HorizontalScrollList from "@/components/horizontalScrollList";
import CircleScrollList from "@/components/circleScrollList";
import { Spinner } from "@heroui/react";
import ActiveOrderTracker from "@/components/ActiveOrderTracker";
import { useSearchParams } from "next/navigation";

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

    const [filters, setFilters] = useState<{
        category: string[];
        sort_by: string;
        service_type: string;
        free_delivery: boolean;
        accepts_vouchers: boolean;
        deal: boolean;
        rating_4_plus: boolean;
    }>({
        category: [], 
        sort_by: "relevance",
        service_type: "all",
        free_delivery: false,
        accepts_vouchers: false,
        deal: false,
        rating_4_plus: false,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [pendingOrder, setPendingOrder] = useState(null);

    const searchParams = useSearchParams();
    const queryCategory = searchParams.get("category");

    // We should only fetch data when the address or filters change
    useEffect(() => {
        async function fetchData() {
            if (!selectedAddress) {
                setLoading(true);
                await fetchUser(); // Ensure we fetch user before trying API calls
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

                // Only fetch if filters or location have changed
                const response = await homeService.fetchHomeData(latitude, longitude, filters);
                if (!response.success || !response.data) throw new Error(response.message || "Invalid home data response");

                setData(response.data);

                const pendingResponse = await homeService.getPendingOrder();
                if (pendingResponse.success && pendingResponse.data) {
                    setPendingOrder(pendingResponse.data);
                } else {
                    setPendingOrder(null);
                }
            } catch (err) {
                console.error("API Error:", err.message);
                setError("Failed to load homepage data.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedAddress, JSON.stringify(filters)]); // Adding JSON.stringify(filters) ensures it only triggers when filters actually change, preventing unnecessary fetches.

    useEffect(() => {
        if (queryCategory) {
            // Find the category ID based on the name (from the URL query)
            const category = data.categories.find(c => c.name.toLowerCase() === queryCategory.toLowerCase());

            if (category) {
                // Set category filter based on matched category ID
                setFilters((prevFilters) => ({
                    ...prevFilters,
                    category: [category.id], // Use the ID of the category
                }));
                console.log("Category filter applied:", category.id);
            }
        }
    }, [queryCategory, data.categories]); // Re-run this effect only when `data.categories` changes

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
            <div>
                <LocationBar />
                <SearchBar />
                <FilterComponent
                    selectedFilters={filters}
                    categories={data.categories}
                    onApplyFilters={(updatedFilters) => setFilters((prevFilters) => ({
                        ...prevFilters,
                        ...updatedFilters,
                    }))} />

                <div className="px-3 md:px-6">
                    {data.promos?.length > 0 && (
                        <>
                            <h2 className="text-sm font-bold mt-4 mb-2 md:text-base">Your Daily Deals</h2>
                            <Deals promos={data.promos} />
                        </>
                    )}

                    {data.categories?.length > 0 && (
                        <>
                            <h2 className="text-sm font-bold mt-4 mb-2 md:text-base">Your Favorite Cuisines</h2>
                            <Categories categories={data.categories} />
                        </>
                    )}

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
                            <img src="/images/restaurant_not_found.png" alt="No Restaurants" className="w-32 h-42 mb-4" />
                            <p className="text-lg font-semibold">No restaurants available in your area.</p>
                            <p className="text-sm text-gray-600">Try searching in another location.</p>
                        </div>
                    )}
                </div>
            </div>

            {modalData && (
                <RestaurantModal
                    isOpen={!!modalData}
                    title={modalData.title}
                    restaurants={modalData.restaurants}
                    onClose={() => setModalData(null)}
                />
            )}
            <div className="relative pb-14">
                <ActiveOrderTracker />
            </div>
        </div>
    );
}
