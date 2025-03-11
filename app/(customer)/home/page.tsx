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

    useEffect(() => {
        async function fetchData() {
            if (!selectedAddress) {
                setLoading(true);
                await fetchUser(); // ✅ Ensure we fetch user before trying API calls
                return;
            }

            setLoading(true);
            try {
                const { latitude, longitude } = selectedAddress || getStoredAddress();
                
                // ✅ Ensure valid lat/lng before calling API
                if (!latitude || !longitude) {
                    setError("Location not found. Please set your address or refresh the page.");
                    setLoading(false);
                    return;
                }

                const response = await homeService.fetchHomeData(latitude, longitude, filters);

                if (!response.success || !response.data) throw new Error(response.message || "Invalid home data response");

                setData(response.data);
            } catch (err) {
                console.error("API Error:", err.message);
                setError("Failed to load homepage data.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedAddress, filters]); // ✅ Refresh when address or filters change

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
                    {/* ✅ Only Show If Promos Exist */}
                    {data.promos?.length > 0 && (
                        <>
                            <h2 className="text-sm font-bold mt-4 mb-2 md:text-base">Your Daily Deals</h2>
                            <Deals promos={data.promos} />
                        </>
                    )}

                    {/* ✅ Only Show If Categories Exist */}
                    {data.categories?.length > 0 && (
                        <>
                            <h2 className="text-sm font-bold mt-4 mb-2 md:text-base">Your Favorite Cuisines</h2>
                            <Categories categories={data.categories} />
                        </>
                    )}

                    {/* ✅ Only Show If Order Again Exists */}
                    {data.order_again?.length > 0 && (
                        <div className="mt-5">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-bold md:text-base">Order Again</h2>
                                <button className="text-primary text-sm flex items-center" 
                                    onClick={() => setModalData({ title: "Order Again", restaurants: data.order_again })}>
                                    View All <IoChevronForwardOutline className="ml-1" />
                                </button>
                            </div>
                            <HorizontalScrollList 
                                items={data.order_again.map((restaurant) => ({
                                    ...restaurant,
                                    total_reviews: restaurant.total_reviews ?? 0
                                }))}
                            />
                        </div>
                    )}

                    {/* ✅ Only Show If Top Restaurants Exist */}
                    {data.top_restaurants?.length > 0 && (
                        <div className="mt-5">
                            <h2 className="text-sm font-bold md:text-base">Top Restaurants</h2>
                            <CircleScrollList items={data.top_restaurants} />
                        </div>
                    )}

                    {/* ✅ Only Show If Fast Delivery Exists */}
                    {data.fast_delivery?.length > 0 && (
                        <div className="mt-5">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-bold md:text-base">Fast Delivery</h2>
                                <button className="text-primary text-sm flex items-center" 
                                    onClick={() => setModalData({ title: "Fast Delivery", restaurants: data.fast_delivery })}>
                                    View All <IoChevronForwardOutline className="ml-1" />
                                </button>
                            </div>
                            <HorizontalScrollList 
                                items={data.fast_delivery.map((restaurant) => ({
                                    ...restaurant,
                                    total_reviews: restaurant.total_reviews ?? 0
                                }))}
                            />
                        </div>
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
                        (filteredRestaurants.length === 0 &&
                        (data?.order_again?.length ?? 0) === 0 &&
                        (data?.top_restaurants?.length ?? 0) === 0 &&
                        (data?.fast_delivery?.length ?? 0) === 0) && (
                            <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500">
                                <img src="/images/restaurant_not_found.png" alt="No Restaurants" className="w-32 h-42 mb-4" />
                                <p className="text-lg font-semibold">No restaurants available in your area.</p>
                                <p className="text-sm text-gray-600">Try searching in another location.</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* ✅ Modal for View All */}
            {modalData && (
                <RestaurantModal
                    isOpen={!!modalData}
                    title={modalData.title}
                    restaurants={modalData.restaurants}
                    onClose={() => setModalData(null)}
                />
            )}
        </div>
    );
}
