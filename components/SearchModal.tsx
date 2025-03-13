"use client";

import { useState, useEffect, useRef } from "react";
import { IoSearch, IoCloseOutline, IoTimeOutline } from "react-icons/io5";
import { searchService } from "@/services/searchService";
import { categoryService } from "@/services/categoryService";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Input,
    Spinner,
} from "@heroui/react";
import FilterComponent from "@/components/filterComponent"; // ✅ Import Filters Component
import RestaurantCard from "@/components/restaurantCard"; // ✅ Import Restaurant Card

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [searchResults, setSearchResults] = useState([]);
    const [similarRestaurants, setSimilarRestaurants] = useState([]);
    const [relatedMenuRestaurants, setRelatedMenuRestaurants] = useState([]);
    const [predictedSearches, setPredictedSearches] = useState([]);
    const [popularSearches, setPopularSearches] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // ✅ Auto-focus input & Fetch Data on Modal Open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            fetchUserLocation();
            fetchSearchData();
            fetchCategories();
        } else {
            resetSearch(); // ✅ Clear search when modal closes
        }
    }, [isOpen]);

    // ✅ Reset Search Data on Close
    const resetSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setSimilarRestaurants([]);
        setRelatedMenuRestaurants([]);
        setPredictedSearches([]);
        setLoading(false);
        setError("");
    };

    // ✅ Fetch User Location (Required for Search)
    const fetchUserLocation = async () => {
        try {
            const storedAddress = getStoredAddress();
            if (storedAddress?.latitude && storedAddress?.longitude) {
                setLatitude(storedAddress.latitude);
                setLongitude(storedAddress.longitude);
                return;
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLatitude(position.coords.latitude);
                        setLongitude(position.coords.longitude);
                    },
                    (error) => console.warn("Geolocation error:", error)
                );
            }
        } catch (error) {
            console.error("Error fetching user location:", error);
        }
    };

    function getStoredAddress() {
        const stored = localStorage.getItem("selected_address");
        return stored ? JSON.parse(stored) : { latitude: null, longitude: null };
    }

    // ✅ Fetch Restaurant Categories (For Filters)
    const fetchCategories = async () => {
        try {
            const response = await categoryService.fetchRestaurantCategories();
            if (response.success) setCategories(response.data.categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    // ✅ Fetch Popular & Recent Searches
    const fetchSearchData = async () => {
        try {
            const [recent, popular] = await Promise.all([
                searchService.fetchSearchHistory(),
                searchService.fetchPopularSearches(),
            ]);

            if (recent.success) setRecentSearches(recent.data.recent_searches);
            if (popular.success) setPopularSearches(popular.data.popular_searches);
        } catch (error) {
            console.error("Error fetching search data:", error);
        }
    };

    // ✅ Handle Search Submission (Press Enter or Click Search)
    const handleSearch = async () => {
        if (searchQuery.trim() === "") return;

        setLoading(true);
        setError("");
        setSearchResults([]); // ✅ Reset search results
        setSimilarRestaurants([]);
        setRelatedMenuRestaurants([]);

        try {
            if (!latitude || !longitude) {
                setError("Location not found. Please set your address.");
                setLoading(false);
                return;
            }

            console.log("Searching with:", { searchQuery, latitude, longitude, filters });

            const response = await searchService.search(searchQuery, latitude, longitude, filters);
            console.log("API Response:", response); // ✅ Log full API response

            if (!response.success) throw new Error(response.message);

            // ✅ Ensure arrays before updating state
            setSearchResults(response.data.restaurants || []);
            setSimilarRestaurants(response.data.similar_restaurants || []);
            setRelatedMenuRestaurants(response.data.related_menu_restaurants || []);

            console.log("Updated searchResults:", response.data.restaurants);
            console.log("Updated similarRestaurants:", response.data.similar_restaurants);
        } catch (err: any) {
            setError(err.message || "Failed to fetch search results.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle Filters Application
    const handleApplyFilters = (selectedFilters) => {
        setFilters(selectedFilters);
    };
    useEffect(() => {
        if (searchQuery.trim() !== "" && latitude && longitude) {
            handleSearch();
        }
    }, [filters]); // ✅ Now runs after filters update
    const handleDeleteRecentSearch = async (query: string) => {
        try {
            const response = await searchService.deleteRecentSearch(query);
            if (response.success) {
                setRecentSearches((prev) => prev.filter((item) => item !== query)); // ✅ Update UI
            }
        } catch (error) {
            console.error("Error deleting search:", error);
        }
    };
    
    const handleClearAllRecentSearches = async () => {
        try {
            const response = await searchService.clearAllRecentSearches();
            if (response.success) {
                setRecentSearches([]); // ✅ Update UI
            }
        } catch (error) {
            console.error("Error clearing all searches:", error);
        }
    };
    
return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="full" hideCloseButton={true}>
        <ModalContent className="h-full flex flex-col">
            {/* ✅ Search Bar */}
            <ModalHeader className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3 w-full">
                    <IoSearch className="text-gray-500 text-xl" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for restaurants or dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        size="md"
                    />
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                    <IoCloseOutline className="text-2xl" />
                </button>
                </div>
             
            </ModalHeader>

            {/* ✅ Filters Component */}
            <FilterComponent categories={categories} onApplyFilters={handleApplyFilters} />

            {/* ✅ Modal Body */}
            <ModalBody className="flex-1 p-4 overflow-y-auto">
                {/* ⏳ Loading Indicator */}
                {loading && (
    <div className="text-gray-500 text-center mt-4 flex items-center justify-center gap-2">
        <Spinner size="sm" />
        <span>Searching...</span>
    </div>
)}


                {/* ❌ Error Message */}
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}

                {/* 🔍 Show Recent & Popular Searches if No Search Yet */}
                {!searchQuery && !loading && (
                    <>
                        {/* 🕒 Recent Searches */}
                        {recentSearches.length > 0 && (
    <div className="mb-4">
        <h3 className="text-gray-800 font-semibold mb-2 flex justify-between">
            Recent Searches
            <button
                className="text-red-500 text-sm font-medium"
                onClick={handleClearAllRecentSearches} // ✅ Clear All Searches
            >
                Clear All
            </button>
        </h3>
        <div className="space-y-2">
            {recentSearches.map((search, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                    <button
                        className="w-full text-left text-gray-600"
                        onClick={() => {
                            setSearchQuery(search);
                            handleSearch();
                        }}
                    >
                        <IoTimeOutline className="mr-2 inline" /> {search}
                    </button>
                    <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => handleDeleteRecentSearch(search)} // ✅ Delete individual search
                    >
                        <IoCloseOutline className="text-lg" />
                    </button>
                </div>
            ))}
        </div>
    </div>
)}


                        {/* 🔥 Popular Searches */}
                        {popularSearches.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-gray-800 font-semibold mb-2">Popular searches</h3>
                                <div className="flex flex-wrap gap-2">
                                    {popularSearches.map((keyword, index) => (
                                        <button 
                                            key={index} 
                                            className="bg-gray-200 px-3 py-2 rounded-full text-sm" 
                                            onClick={() => {
                                                setSearchQuery(keyword);
                                                handleSearch();
                                            }}
                                        >
                                            {keyword}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

            {/* 🍽️ Search Results */}
{!loading && searchResults.length > 0 ? (
    <div className="grid grid-cols-1 gap-4">
        {searchResults.map((restaurant: any) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
    </div>
) : (
    !loading && searchQuery && (
        <div className="text-gray-500 text-center mt-4"> {/* ✅ Fixed (was <p>) */}
            No restaurants found.
        </div>
    )
)}


                {/* 🏬 Similar Restaurants */}
                {!loading && similarRestaurants.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-gray-800 font-semibold mb-2">Similar Restaurants</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {similarRestaurants.map((restaurant: any) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>
                    </div>
                )}
                {/* 🏬 Similar Restaurants */}
                {!loading && relatedMenuRestaurants.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-gray-800 font-semibold mb-2">Related Menu Restaurants</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {relatedMenuRestaurants.map((restaurant: any) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>
                    </div>
                )}
            </ModalBody>
        </ModalContent>
    </Modal>
);
}
