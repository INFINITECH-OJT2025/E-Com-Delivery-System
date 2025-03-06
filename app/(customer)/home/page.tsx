"use client";
import { useState, useEffect } from "react";
import { homeService } from "@/services/homeService";
import Navbar from "@/components/Navbar";
import LocationBar from "@/components/LocationBar";
import TabsSection from "@/components/TabsSection";
import SearchBar from "@/components/SearchBar";
import Deals from "./components/deals";
import Categories from "./components/categories";
import RestaurantCard from "./components/restaurantCard";
import { Spinner } from "@heroui/react";

export default function HomePage() {
    const [data, setData] = useState({ promos: [], categories: [], restaurants: [] });
    const [selectedTab, setSelectedTab] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await homeService.fetchHomeData();

                if (!response.success || !response.data) {
                    throw new Error(response.message || "Invalid home data response");
                }

                setData(response.data);
            } catch (err) {
                console.error("API Error:", err.message);
                setError("Failed to load homepage data.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

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
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
