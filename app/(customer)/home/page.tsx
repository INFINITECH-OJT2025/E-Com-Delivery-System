"use client";
import { useState, useEffect } from "react";
import { homeService } from "@/services/homeService";
import { deliveryFeeService } from "@/services/deliveryFeeService";
import { useUser } from "@/context/userContext";
import Navbar from "@/components/Navbar";
import LocationBar from "@/components/LocationBar";
import TabsSection from "@/components/TabsSection";
import SearchBar from "@/components/SearchBar";
import Deals from "./components/deals";
import Categories from "./components/categories";
import RestaurantCard from "./components/restaurantCard";
import { Spinner } from "@heroui/react";

export default function HomePage() {
    const { selectedAddress } = useUser(); // ✅ Get selected address from context
    const [data, setData] = useState({ promos: [], categories: [], restaurants: [] });
    const [deliveryFees, setDeliveryFees] = useState<Record<number, number>>({}); // ✅ Store delivery fees by restaurant ID
    const [selectedTab, setSelectedTab] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                let latitude, longitude;

                // ✅ Use selected address first, fallback to localStorage
                if (selectedAddress) {
                    latitude = selectedAddress.latitude;
                    longitude = selectedAddress.longitude;
                } else {
                    const storedAddress = localStorage.getItem("selected_address");
                    if (storedAddress) {
                        const parsedAddress = JSON.parse(storedAddress);
                        latitude = parsedAddress.latitude;
                        longitude = parsedAddress.longitude;
                    }
                }

                // ✅ Fetch home data with user location
                const response = await homeService.fetchHomeData(latitude, longitude);
                if (!response.success || !response.data) {
                    throw new Error(response.message || "Invalid home data response");
                }

                setData(response.data);

                // ✅ Fetch delivery fees for all restaurants
                if (latitude && longitude) {
                    fetchDeliveryFees(response.data.restaurants, latitude, longitude);
                }
            } catch (err) {
                console.error("API Error:", err.message);
                setError("Failed to load homepage data.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedAddress]); // ✅ Re-fetch when selected address changes

    /**
     * ✅ Fetch delivery fees for multiple restaurants at once
     */
    async function fetchDeliveryFees(restaurants, latitude, longitude) {
        const fees = await Promise.all(
            restaurants.map(async (restaurant) => {
                const response = await deliveryFeeService.fetchDeliveryFee(restaurant.id, latitude, longitude);
                return { id: restaurant.id, fee: response.success ? response.data.delivery_fee : null };
            })
        );

        // ✅ Store fees in state
        const feesMap = fees.reduce((acc, { id, fee }) => ({ ...acc, [id]: fee }), {});
        setDeliveryFees(feesMap);
    }

    /**
     * ✅ Filter restaurants based on selected service type
     */
    const filteredRestaurants = data.restaurants.filter((restaurant) =>
        selectedTab === "both" ? true : restaurant.service_type === selectedTab
    );

    if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

    return (
        <div className="w-full h-screen flex flex-col overflow-y-auto bg-white">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                <LocationBar />
                <TabsSection selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                <SearchBar />

                <div className="px-3 md:px-6">
                    <h2 className="text-sm font-bold mt-4 mb-2 md:text-base">Your Daily Deals</h2>
                    <Deals promos={data.promos} />

                    <h2 className="text-sm font-bold mt-4 mb-2 md:text-base">Your Favorite Cuisines</h2>
                    <Categories categories={data.categories} />

                    <h2 className="text-sm font-bold mt-4 mb-2 md:text-base">Restaurants</h2>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {filteredRestaurants.map((restaurant) => (
                            <RestaurantCard 
                                key={restaurant.id} 
                                restaurant={restaurant} 
                                deliveryFee={deliveryFees[restaurant.id] ?? null} // ✅ Pass pre-fetched delivery fee
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
