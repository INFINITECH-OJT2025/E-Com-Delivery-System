"use client";

import { useState, useEffect } from "react";
import { homeService } from "@/services/homeService";
import NavbarComponent from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import SectionHeader from "@/components/SectionHeader";
import Deals from "./components/deals";
import Categories from "./components/categories";
import RestaurantCard from "./components/restaurantCard";

export default function HomePage() {
    const [data, setData] = useState({ promos: [], categories: [], restaurants: [] });

    useEffect(() => {
        homeService.fetchHomeData().then((res) => setData(res.data));
    }, []);

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <NavbarComponent />
            <SearchBar />

            {/* Daily Deals Section */}
            <SectionHeader title="Your Daily Deals" />
            <Deals promos={data.promos} />

            {/* Favorite Cuisines Section */}
            <SectionHeader title="Your Favorite Cuisines" />
            <Categories categories={data.categories} />

            {/* Restaurant Section */}
            <SectionHeader title="Closed for Now" />
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
            </div>
        </div>
    );
}
