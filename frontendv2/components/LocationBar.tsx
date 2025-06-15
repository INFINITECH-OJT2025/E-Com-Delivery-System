"use client";
import { useEffect, useState } from "react";
import { IoLocationSharp } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import { googleMapsService } from "@/services/googleMapsService";
import { addressService } from "@/services/addressService";

export default function LocationBar() {
    const { selectedAddress, setSelectedAddress, user, fetchUser } = useUser();
    const router = useRouter();
    const [location, setLocation] = useState<string>("Fetching location...");
    const [modalOpen, setModalOpen] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);

    useEffect(() => {
        async function loadAddress() {
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

            // ✅ Fetch user addresses from the database
            if (user?.addresses?.length > 0) {
                const defaultAddress = user.addresses.find((addr) => addr.is_default) || user.addresses[0];
                if (defaultAddress) {
                    setSelectedAddress(defaultAddress);
                    setLocation(defaultAddress.address);
                    localStorage.setItem("selected_address", JSON.stringify(defaultAddress));
                }
                return;
            }

            // ✅ If no saved address, fetch GPS location
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async ({ coords }) => {
                        const { latitude, longitude } = coords;
                        const address = await googleMapsService.getAddressFromCoords(latitude, longitude);

                        const newAddress = {
                            label: "Current Location",
                            address: address || "Unknown Location",
                            latitude,
                            longitude,
                            is_default: true,
                        };

                        // ✅ Save new address in database
                        const response = await addressService.addAddress(newAddress);
                        if (response.success) {
                            await fetchUser(); // ✅ Refresh user context after adding
                            setSelectedAddress(response.address);
                            localStorage.setItem("selected_address", JSON.stringify(response.address));
                        }
                        setLocation(address || "Location not found");
                    },
                    () => setLocation("Location permission denied")
                );
            }
        }

        loadAddress();
    }, [selectedAddress, user?.addresses]); // ✅ Re-run when `selectedAddress` or `user.addresses` changes

    /** ✅ Handle "Use Current Location" */
    const handleUseCurrentLocation = async () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const { latitude, longitude } = coords;
                const address = await googleMapsService.getAddressFromCoords(latitude, longitude);

                const newAddress = {
                    label: "Current Location",
                    address: address || "Unknown Location",
                    latitude,
                    longitude,
                    is_default: true,
                };

                // ✅ Save to database
                const response = await addressService.addAddress(newAddress);
                if (response.success) {
                    await fetchUser(); // ✅ Refresh user addresses from database
                    setSelectedAddress(response.address);
                    localStorage.setItem("selected_address", JSON.stringify(response.address));
                }

                setLoadingLocation(false);
                setModalOpen(false);
            },
            () => {
                alert("Failed to get location. Please enable location access.");
                setLoadingLocation(false);
            }
        );
    };

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
                onSelect={async (address) => {
                    if (!selectedAddress || selectedAddress.address !== address.address) {
                        setSelectedAddress(address);
                        localStorage.setItem("selected_address", JSON.stringify(address));
                        await fetchUser(); // ✅ Refresh user context after selection
                    }
                    setModalOpen(false);
                }}
                onUseCurrentLocation={handleUseCurrentLocation}
                loadingLocation={loadingLocation}
            />
        </>
    );
}
