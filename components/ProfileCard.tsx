"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import { Bookmark, Heart, MapPin, Wallet, User } from "lucide-react";
import AddressModal from "@/components/AddressSelectionModal";
import FavoriteModal from "@/components/FavoriteModal";
import OrderModal from "@/components/OrderModal";


interface ProfileCardProps {
    user: { name: string; email: string } | null;
}

export default function ProfileCard({ user }: ProfileCardProps) {
    const [isAddressOpen, setAddressOpen] = useState(false);
    const [isFavoriteOpen, setFavoriteOpen] = useState(false);
    const [isOrderOpen, setOrderOpen] = useState(false);
    const [isWalletOpen, setWalletOpen] = useState(false);

    return (
        <>
            <Card className="m-4 p-6 rounded-lg shadow-md bg-white flex flex-col items-center text-center">
                {/* ✅ User Info */}
                <div className="flex flex-col items-center">
                    <div className="bg-gray-200 rounded-full p-4">
                        <User className="w-10 h-10 text-gray-500" />
                    </div>
                    <h2 className="text-xl font-bold mt-3">{user ? user.name : "Guest"}</h2>
                    <p className="text-sm text-gray-500">{user ? user.email : "Not Logged In"}</p>
                </div>

                {/* ✅ Quick Actions */}
                <div className="grid grid-cols-3 gap-5 mt-6">
                    {/* 🛍 Orders */}
                    <button onClick={() => setOrderOpen(true)} className="flex flex-col items-center group">
                        <Bookmark className="w-7 h-7 text-gray-600 group-hover:text-blue-500 transition" />
                        <p className="text-xs text-gray-700 mt-1 group-hover:text-blue-500">Orders</p>
                    </button>

                    {/* ❤️ Favorites */}
                    <button onClick={() => setFavoriteOpen(true)} className="flex flex-col items-center group">
                        <Heart className="w-7 h-7 text-gray-600 group-hover:text-red-500 transition" />
                        <p className="text-xs text-gray-700 mt-1 group-hover:text-red-500">Favorites</p>
                    </button>

                    {/* 📍 Addresses */}
                    <button onClick={() => setAddressOpen(true)} className="flex flex-col items-center group">
                        <MapPin className="w-7 h-7 text-gray-600 group-hover:text-green-500 transition" />
                        <p className="text-xs text-gray-700 mt-1 group-hover:text-green-500">Addresses</p>
                    </button>

                </div>

                {/* ✅ Manage Profile Button */}
                <Button variant="bordered" className="mt-6 w-full" onClick={() => console.log("Navigate to Profile Settings")}>
                    Manage Profile
                </Button>
            </Card>

            {/* ✅ Modals */}
            <OrderModal isOpen={isOrderOpen} onClose={() => setOrderOpen(false)} />
            <FavoriteModal isOpen={isFavoriteOpen} onClose={() => setFavoriteOpen(false)} />
            <AddressModal isOpen={isAddressOpen} onClose={() => setAddressOpen(false)} />
        </>
    );
}