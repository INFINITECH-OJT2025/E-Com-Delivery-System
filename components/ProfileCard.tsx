"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import { Bookmark, Heart, MapPin } from "lucide-react";
import AddressModal from "@/components/AddressSelectionModal";
import FavoriteModal from "@/components/FavoriteModal";
import OrderModal from "@/components/OrderModal";
import ProfileEditModal from "@/components/ProfileEditModal";

interface ProfileCardProps {
    user: { id: number; name: string; email: string } | null;
}

export default function ProfileCard({ user }: ProfileCardProps) {
    const [isAddressOpen, setAddressOpen] = useState(false);
    const [isFavoriteOpen, setFavoriteOpen] = useState(false);
    const [isOrderOpen, setOrderOpen] = useState(false);
    const [isProfileOpen, setProfileOpen] = useState(false);

    // ✅ Default Profile Image Logic
    const defaultProfileImages = [
        "/images/inifnitech_default_profile1.jpg",
        "/images/inifnitech_default_profile2.jpg",
        "/images/inifnitech_default_profile3.jpg",
        "/images/inifnitech_default_profile4.jpg",
        "/images/inifnitech_default_profile5.jpg",
        "/images/inifnitech_default_profile6.jpg",
        "/images/inifnitech_default_profile7.jpg",
        "/images/inifnitech_default_profile8.jpg",
        "/images/inifnitech_default_profile9.jpg",
    ];
    const getRandomProfileImage = (id: number | null) => {
        if (id === null) return defaultProfileImages[0]; // Default for guests
        return defaultProfileImages[id % defaultProfileImages.length]; // Consistent image selection
    };

    return (
        <>
            <Card className="m-4 p-6 rounded-lg shadow-md bg-white flex flex-col items-center text-center">
                {/* ✅ User Info */}
                <div className="flex flex-col items-center">
                    <div className="bg-gray-200 rounded-full">
                        <img
                            src={getRandomProfileImage(user?.id || null)}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                    </div>
                    <h2 className="text-xl font-bold mt-3">{user ? user.name : "Guest"}</h2>
                    <p className="text-sm text-gray-500">{user ? user.email : "Not Logged In"}</p>
                </div>

                {/* ✅ Quick Actions */}
                <div className="grid grid-cols-3 gap-5 mt-6">
                    <button onClick={() => setOrderOpen(true)} className="flex flex-col items-center group">
                        <Bookmark className="w-7 h-7 text-gray-600 group-hover:text-blue-500 transition" />
                        <p className="text-xs text-gray-700 mt-1 group-hover:text-blue-500">Orders</p>
                    </button>
                    <button onClick={() => setFavoriteOpen(true)} className="flex flex-col items-center group">
                        <Heart className="w-7 h-7 text-gray-600 group-hover:text-red-500 transition" />
                        <p className="text-xs text-gray-700 mt-1 group-hover:text-red-500">Favorites</p>
                    </button>
                    <button onClick={() => setAddressOpen(true)} className="flex flex-col items-center group">
                        <MapPin className="w-7 h-7 text-gray-600 group-hover:text-green-500 transition" />
                        <p className="text-xs text-gray-700 mt-1 group-hover:text-green-500">Addresses</p>
                    </button>
                </div>

                {/* ✅ Manage Profile Button */}
                <Button variant="bordered" className="mt-6 w-full" onPress={() => setProfileOpen(true)}>
                    Manage Profile
                </Button>
            </Card>

            {/* ✅ Modals */}
            <OrderModal isOpen={isOrderOpen} onClose={() => setOrderOpen(false)} />
            <FavoriteModal isOpen={isFavoriteOpen} onClose={() => setFavoriteOpen(false)} />
            <AddressModal isOpen={isAddressOpen} onClose={() => setAddressOpen(false)} />
            <ProfileEditModal isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} />
        </>
    );
}
