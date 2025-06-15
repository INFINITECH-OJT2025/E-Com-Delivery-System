"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { restaurantService } from "@/services/restaurantService";
import { deliveryFeeService } from "@/services/deliveryFeeService";
import { useUser } from "@/context/userContext";
import RestaurantHeader from "@/components/RestaurantHeader";
import Breadcrumbs from "@/components/Breadcrumbs";
import ServiceDetails from "@/components/ServiceDetails";
import MenuTabs from "@/components/MenuTabs";
import MenuItem from "@/components/MenuItem";
import MenuSearchBar from "@/components/MenuSearchBar";
import { Spinner } from "@heroui/react";
import { IoSearch } from "react-icons/io5";
import { Button } from "@heroui/react";

export default function RestaurantPage() {
    const { slug } = useParams();
    const { selectedAddress } = useUser();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false); // ✅ Add state for search modal
    const menuRefs = useRef({});

    useEffect(() => {
        if (!selectedAddress) return;

        async function fetchData() {
            try {
                setLoading(true);
                const response = await restaurantService.fetchRestaurant(slug);

                if (!response.success || !response.data) {
                    throw new Error(response.message || "Invalid API response");
                }

                let restaurantData = response.data;

                // ✅ Ensure each menu item has a category
                const processedMenus = restaurantData.menus.map((menu) => ({
                    ...menu,
                    category: restaurantData.menu_categories.find(cat => cat.id === menu.menu_category_id) || { name: "Uncategorized" }
                }));

                // ✅ Fetch shipping fee based on user location
                const feeResponse = await deliveryFeeService.fetchDeliveryFee(
                    restaurantData.id,
                    selectedAddress.latitude,
                    selectedAddress.longitude
                );

                if (feeResponse.success && feeResponse.data) {
                    restaurantData.delivery_fee = feeResponse.data.delivery_fee;
                    restaurantData.distance_km = feeResponse.data.distance_km;
                } else {
                    restaurantData.delivery_fee = undefined;
                    restaurantData.distance_km = "Unknown";
                }

                setRestaurant({ ...restaurantData, menus: processedMenus });
            } catch (err) {
                console.error("API Error:", err.message);
                setError("Failed to load restaurant data. Please try again.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [slug, selectedAddress]);

    if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

    const categories = [
        { name: "Best Sellers", count: restaurant.best_sellers.length },
        ...restaurant.menu_categories.map(cat => ({
            name: cat.name,
            count: restaurant.menus.filter(item => item.category.name === cat.name).length
        }))
    ];

    const handleScrollToCategory = (category) => {
        const ref = menuRefs.current[category];
        if (ref) {
            ref.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="w-full h-screen flex flex-col bg-gray-50">
            <div className="">
                <Breadcrumbs restaurant={restaurant} />
                <RestaurantHeader restaurant={restaurant} />
                <ServiceDetails restaurant={restaurant} />

                {/* 🛑 Closed Banner */}
                {restaurant.status === "closed" && (
                    <div className="bg-red-600 text-white text-center py-2 font-semibold">
                        This restaurant is currently closed.
                    </div>
                )}

                {/* ✅ Sticky Search Button & Tabs */}
                <div className="sticky top-0 z-50 bg-white pt-1 shadow-md">
                <div
    onClick={() => {
        if (restaurant.status !== "closed") setIsSearchOpen(true);
    }}
    className={`flex items-center bg-gray-100 rounded-full px-4 py-3 transition-all cursor-pointer mx-4 my-4 
        ${restaurant.status === "closed" ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}
    `}
>
    <IoSearch className="text-gray-500 text-xl" />
    <input
        type="text"
        placeholder="Search..."
        readOnly
        className="px-2 text-sm bg-transparent border-none focus:ring-0 outline-none md:text-base"
    />
</div>

                    
                    <MenuTabs categories={categories} onSelectCategory={handleScrollToCategory} />
                </div>

                {/* ✅ Menu Items Section - Disabled if Closed */}
                <div className={`px-4 py-2 space-y-6 ${restaurant.status === "closed" ? "opacity-50 pointer-events-none" : ""}`}>
                    {categories.map(({ name }) => (
                        <div
  key={name}
  ref={(el) => (menuRefs.current[name] = el)}
  className="scroll-mt-[120px]" // ✅ adjust this based on your sticky header height
>

                            <h3 className="text-lg font-bold text-gray-800 mt-6">{name}</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {restaurant.menus
                                    .filter((item) => name === "Best Sellers"
                                        ? restaurant.best_sellers.some(best => best.id === item.id)
                                        : item.category.name === name)
                                    .map((menuItem) => (
                                        <MenuItem key={menuItem.id} menuItem={menuItem} />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ✅ Search Modal */}
            <MenuSearchBar 
                isOpen={isSearchOpen} 
                onClose={() => setIsSearchOpen(false)} 
                menuItems={restaurant?.menus || []} 
            />
        </div>
    );
}
