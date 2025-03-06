"use client";
import { useEffect, useState } from "react";
import { IoLocationSharp } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import { googleMapsService } from "@/services/googleMapsService";

export default function LocationBar() {
    const { user, fetchUser } = useUser();
    const router = useRouter();
    const [location, setLocation] = useState<string>("Fetching location...");
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (user?.default_address) {
            setLocation(user.default_address.address);
            return;
        }

        const cachedLocation = localStorage.getItem("user_location");
        if (cachedLocation) {
            setLocation(cachedLocation);
            return;
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async ({ coords }) => {
                    const { latitude, longitude } = coords;
                    const address = await googleMapsService.getAddressFromCoords(latitude, longitude);
                    setLocation(address || "Location not found");
                    localStorage.setItem("user_location", address || "Unknown location");
                },
                () => setLocation("Location permission denied")
            );
        }
    }, [user?.default_address]); // ✅ React to changes in `default_address`

    return (
        <>
            {/* 📍 Location Bar (Opens Address Selector) */}
            <div onClick={() => setModalOpen(true)} className="w-full flex items-center px-4 py-3 cursor-pointer">
                <IoLocationSharp className="text-primary text-2xl flex-shrink-0" />
                <p className="ml-2 text-base font-semibold text-gray-700 truncate w-full">{location}</p>
            </div>

            {/* 📍 Address Selector Modal */}
            <AddressSelectionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onOpenEditor={(address) => router.push(`/addresses/edit?addressId=${address?.id || ""}`)}
                addresses={user?.addresses || []}
            />
        </>
    );
}
