"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { favoriteService } from "@/services/favoriteService";

interface Favorite {
    id: number;
    favoritable_type: "menu" | "restaurant";
    favoritable_id: number;
    name: string;
    slug: string;
    banner_image: string;
    rating: number;
    total_reviews: number;
    is_open: boolean;
    distance_km?: number;
    delivery_fee?: number;
    estimated_time?: string;
    is_in_range: boolean;
    restaurant_id?: number;
}

interface SimilarRestaurant {
    restaurant_id: number;
    name: string;
    slug: string;
    banner_image: string;
    rating: number;
    status: string;
    service_type: string;
    distance_km: number;
    delivery_fee?: number;
    estimated_time?: string;
}

interface FavoriteContextType {
    favorites: Favorite[];
    similarRestaurants: SimilarRestaurant[];
    fetchFavorites: () => Promise<void>;
    toggleFavorite: (type: "menu" | "restaurant", id: number) => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | null>(null);

export function FavoriteProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [similarRestaurants, setSimilarRestaurants] = useState<SimilarRestaurant[]>([]);
    const [isFetched, setIsFetched] = useState(false); // ✅ New flag to prevent refetch on open

    /** ✅ Fetch User's Favorite Items */
    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) return;
            const response = await favoriteService.fetchFavorites();
            if (response.success) {
                setFavorites(response.data?.favorites || []);
                setSimilarRestaurants(response.data?.similar_restaurants || []);
                setIsFetched(true); // ✅ Mark as fetched
            } else {
                console.error("Failed to fetch favorites:", response.message);
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    /** ✅ Add or Remove Favorite (Optimized - No Refetch) */
    const toggleFavorite = async (type: "menu" | "restaurant", id: number) => {
        try {
            const isFavorited = favorites.some(fav => fav.favoritable_id === id && fav.favoritable_type === type);

            if (isFavorited) {
                const response = await favoriteService.removeFavorite(id);
                if (response.success) {
                    setFavorites((prev) => prev.filter(fav => !(fav.favoritable_id === id && fav.favoritable_type === type)));
                    setSimilarRestaurants((prev) => prev.filter(sim => sim.restaurant_id !== id));
                }
            } else {
                const response = await favoriteService.addFavorite(type, id);
                if (response.success && response.data) {
                    setFavorites((prev) => [...prev, response.data]);
                }
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    useEffect(() => {
        if (!isFetched) fetchFavorites(); // ✅ Only fetch once when the app loads
    }, []);

    return (
        <FavoriteContext.Provider value={{ favorites, similarRestaurants, fetchFavorites, toggleFavorite }}>
            {children}
        </FavoriteContext.Provider>
    );
}

// ✅ Hook for accessing favorite context
export function useFavorite() {
    const context = useContext(FavoriteContext);
    if (!context) {
        throw new Error("useFavorite must be used within a FavoriteProvider");
    }
    return context;
}
