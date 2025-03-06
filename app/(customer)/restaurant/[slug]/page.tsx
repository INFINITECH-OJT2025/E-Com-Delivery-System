"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { restaurantService } from "@/services/restaurantService";
import RestaurantHeader from "./components/RestaurantHeader";
import Breadcrumbs from "./components/Breadcrumbs";
import ServiceDetails from "./components/ServiceDetails";
import MenuTabs from "./components/MenuTabs";
import MenuItem from "./components/MenuItem";
import SearchBar from "@/components/SearchBar";
import { Spinner } from "@heroui/react";

export default function RestaurantPage() {
    const { slug } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const menuRefs = useRef({});

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await restaurantService.fetchRestaurant(slug);

                if (!response.success || !response.data) {
                    throw new Error(response.message || "Invalid API response");
                }

                const restaurantData = response.data;

                // ✅ Ensure each menu item has a category
                const processedMenus = restaurantData.menus.map((menu) => ({
                    ...menu,
                    category: restaurantData.menu_categories.find(cat => cat.id === menu.menu_category_id) || { name: "Uncategorized" }
                }));

                setRestaurant({ ...restaurantData, menus: processedMenus });
            } catch (err) {
                console.error("API Error:", err.message);
                setError("Failed to load restaurant data. Please try again.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [slug]);

    if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

    // Get unique categories with item counts
    const categories = [
        { name: "Best Sellers", count: restaurant.best_sellers.length }, // Ensure "Best Sellers" always first
        ...restaurant.menu_categories.map(cat => ({
            name: cat.name,
            count: restaurant.menus.filter(item => item.category.name === cat.name).length
        }))
    ];

    // Scroll to category when tab is clicked
    const handleScrollToCategory = (category) => {
        const ref = menuRefs.current[category];
        if (ref) {
            ref.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="w-full h-screen flex flex-col bg-gray-50">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Breadcrumbs, Header, and Details (Inside Scrollable Section) */}
                <Breadcrumbs restaurant={restaurant} />
                <RestaurantHeader restaurant={restaurant} />
                <ServiceDetails restaurant={restaurant} />

                {/* Sticky SearchBar & MenuTabs */}
                <div className="sticky top-0 z-50 bg-white shadow-md">
                    <SearchBar />
                    <MenuTabs categories={categories} onSelectCategory={handleScrollToCategory} />
                </div>

                {/* Menu Items Section */}
                <div className="px-4 py-6 space-y-6">
                    {categories.map(({ name }) => (
                        <div key={name} ref={(el) => (menuRefs.current[name] = el)}>
                            <h3 className="text-lg font-bold text-gray-800 mt-6">{name}</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {restaurant.menus
                                    .filter((item) => name === "Best Sellers" ? restaurant.best_sellers.some(best => best.id === item.id) : item.category.name === name)
                                    .map((menuItem) => (
                                        <MenuItem key={menuItem.id} menuItem={menuItem} />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
