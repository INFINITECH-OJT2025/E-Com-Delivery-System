"use client";
import { useEffect, useState } from "react";
import { IoLocationSharp } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import { googleMapsService } from "@/services/googleMapsService";

export default function LocationBar() {
    const { selectedAddress, setSelectedAddress, user } = useUser();
    const router = useRouter();
    const [location, setLocation] = useState<string>("Fetching location...");
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        // ✅ If an address is already selected, just display it
        if (selectedAddress) {
            setLocation(selectedAddress.address);
            return;
        }

        // ✅ Check localStorage for last selected address
        const cachedAddress = localStorage.getItem("selected_address");
        if (cachedAddress) {
            const parsedAddress = JSON.parse(cachedAddress);
            if (!selectedAddress || selectedAddress.address !== parsedAddress.address) {
                setSelectedAddress(parsedAddress);
            }
            setLocation(parsedAddress.address);
            return;
        }

        // ✅ Use default user address
        if (user?.default_address) {
            setSelectedAddress(user.default_address);
            setLocation(user.default_address.address);
            return;
        }

        // ✅ Only fetch GPS location if no address is set
        if (!selectedAddress && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async ({ coords }) => {
                    const { latitude, longitude } = coords;
                    const address = await googleMapsService.getAddressFromCoords(latitude, longitude);
                    if (address) {
                        setSelectedAddress({ address, latitude, longitude });
                        localStorage.setItem("selected_address", JSON.stringify({ address, latitude, longitude }));
                        setLocation(address);
                    } else {
                        setLocation("Location not found");
                    }
                },
                () => setLocation("Location permission denied")
            );
        }
    }, [selectedAddress, user?.default_address]); // ✅ Only run when `selectedAddress` or `user.default_address` changes

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
                onSelect={(address) => {
                    if (!selectedAddress || selectedAddress.address !== address.address) {
                        setSelectedAddress(address);
                        localStorage.setItem("selected_address", JSON.stringify(address));
                    }
                    setModalOpen(false);
                }}
            />
        </>
    );
}
