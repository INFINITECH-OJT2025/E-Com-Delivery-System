"use client";
import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@heroui/react";
import { MapPin, Pencil, Plus, X, Trash } from "lucide-react";
import { googleMapsService } from "@/services/googleMapsService";
import { addressService } from "@/services/addressService";
import { useUser } from "@/context/userContext";
import dynamic from "next/dynamic"; // ✅ Lazy-load the modal

// ✅ Lazy Load AddressEditorModal (loads only when needed)
const AddressEditorModal = dynamic(() => import("./AddressEditorModal"), { ssr: false });

interface AddressSelectionProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddressSelectionModal({ isOpen, onClose }: AddressSelectionProps) {
    const { user, fetchUser, setDefaultAddress } = useUser();
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

    // ✅ **Refetch Addresses Only When Modal Opens**
    useEffect(() => {
        if (isOpen) {
            fetchUser();
        }
    }, [isOpen]);

    // ✅ **Ensure Selected Address Updates Properly**
    useEffect(() => {
        if (user?.default_address) {
            setSelectedAddress(user.default_address);
        } else if (user?.addresses?.length > 0) {
            setSelectedAddress(user.addresses[0]);
        } else {
            setSelectedAddress(null);
        }
    }, [user?.addresses]);

    // ✅ **Handle "Use My Current Location"**
    const handleUseCurrentLocation = async () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const address = await googleMapsService.getAddressFromCoords(latitude, longitude);

                // ✅ Save as new address in backend
                const newAddress = {
                    label: "Current Location",
                    address: address || "Unknown Location",
                    latitude,
                    longitude,
                    is_default: true, // ✅ Automatically set as default
                };

                const response = await addressService.addAddress(newAddress);
                if (response.success) {
                    await fetchUser(); // ✅ Refresh user addresses
                }

                setLoadingLocation(false);
                onClose(); // ✅ Close modal
            },
            () => {
                alert("Failed to get location. Please enable location access.");
                setLoadingLocation(false);
            }
        );
    };

    // ✅ **Set Address as Default**
    const handleSetDefault = async (addressId: number) => {
        await setDefaultAddress(addressId);
        await fetchUser();
        onClose(); // ✅ Close modal after selecting
    };

    // ✅ **Open Address Editor Modal**
    const openEditor = (addressId?: number) => {
        setEditingAddressId(addressId || null);
        setEditorOpen(true);
    };

    // ✅ **Delete Address**
    const handleDelete = async (addressId: number) => {
        if (confirm("Are you sure you want to delete this address?")) {
            await addressService.deleteAddress(addressId);
            await fetchUser(); // ✅ Refresh addresses list
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onClose} placement="bottom">
                <ModalContent className="rounded-t-2xl bg-white shadow-lg">
                    <ModalHeader className="flex items-center justify-between p-4">
                        <h2 className="text-lg font-bold text-gray-900">Where should we deliver your order?</h2>
                        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </ModalHeader>

                    <ModalBody className="p-4 space-y-4">
                        {/* 📍 Selected Address */}
                        {selectedAddress && (
                            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg shadow-md">
                                <MapPin className="text-primary w-5 h-5" />
                                <div>
                                    <p className="font-semibold">{selectedAddress.label}</p>
                                    <p className="text-sm text-gray-600">{selectedAddress.address}</p>
                                </div>
                            </div>
                        )}

                        {/* 📍 Use Current Location */}
                        <Button
                            variant="bordered"
                            className="w-full flex items-center gap-2 rounded-lg border-primary text-primary"
                            onPress={handleUseCurrentLocation}
                            isLoading={loadingLocation}
                        >
                            <MapPin className="text-primary w-5 h-5" /> Use my current location
                        </Button>

                        {/* 📍 Saved Addresses List */}
                        <div className="space-y-2">
                            {user?.addresses?.map((address) => (
                                <div
                                    key={address.id}
                                    className={`flex items-center justify-between p-3 border rounded-lg transition hover:shadow-md ${
                                        address.is_default ? "border-primary bg-primary/10" : "border-gray-300"
                                    }`}
                                >
                                    <div onClick={() => handleSetDefault(address.id)} className="cursor-pointer">
                                        <p className="font-semibold">{address.label}</p>
                                        <p className="text-sm text-gray-600">{address.address}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* ✏ Edit */}
                                        <button onClick={() => openEditor(address.id)}>
                                            <Pencil className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                                        </button>

                                        {/* ❌ Delete */}
                                        <button onClick={() => handleDelete(address.id)}>
                                            <Trash className="w-4 h-4 text-red-500 hover:text-red-700" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ➕ Add New Address */}
                        <Button
                            variant="ghost"
                            className="w-full flex items-center gap-2 text-primary hover:bg-primary/10"
                            onPress={() => openEditor()}
                        >
                            <Plus className="w-5 h-5" /> Add a new address
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* 📍 Address Editor Modal (Only renders when open) */}
            {editorOpen && (
                <AddressEditorModal isOpen={editorOpen} onClose={() => setEditorOpen(false)} addressId={editingAddressId} />
            )}
        </>
    );
}
