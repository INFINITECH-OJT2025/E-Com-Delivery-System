"use client";
import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, ModalFooter } from "@heroui/react";
import { MapPin, Pencil, Plus, Trash } from "lucide-react";
import { googleMapsService } from "@/services/googleMapsService";
import { addressService } from "@/services/addressService";
import { useUser } from "@/context/userContext";
import dynamic from "next/dynamic";
import AlertModal from "@/components/AlertModal"; // ✅ Import reusable alert modal

// ✅ Lazy Load AddressEditorModal
const AddressEditorModal = dynamic(() => import("./AddressEditorModal"), { ssr: false });

interface AddressSelectionProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddressSelectionModal({ isOpen, onClose }: AddressSelectionProps) {
    const { user, fetchUser, setSelectedAddress, selectedAddress, setDefaultAddress } = useUser();
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteAddressId, setDeleteAddressId] = useState<number | null>(null);

    // ✅ **Fetch Addresses Only When Modal Opens & Prevent Unnecessary Overwrites**
    useEffect(() => {
        if (isOpen && !user?.addresses) {
            fetchUser();
        }
    }, [isOpen]);

    // ✅ **Preserve Selected Address Properly**
    useEffect(() => {
        if (!selectedAddress && user?.addresses?.length > 0) {
            setSelectedAddress(user.default_address || user.addresses[0]);
        }
    }, [user?.addresses]);

    // ✅ **Use Current Location**
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

                const response = await addressService.addAddress(newAddress);
                if (response.success) {
                    await fetchUser();
                    setSelectedAddress(newAddress);
                    localStorage.setItem("selected_address", JSON.stringify(newAddress));
                }

                setLoadingLocation(false);
                onClose();
            },
            () => {
                alert("Failed to get location. Please enable location access.");
                setLoadingLocation(false);
            }
        );
    };

    // ✅ **Set Default Address Safely**
    const handleSetDefault = async (address: any, event: React.MouseEvent) => {
        event.stopPropagation(); // ✅ Prevents Edit/Delete from triggering selection
        await setDefaultAddress(address.id);
        setSelectedAddress(address);
        localStorage.setItem("selected_address", JSON.stringify(address));
        onClose();
    };

    // ✅ **Open Address Editor**
    const openEditor = (addressId?: number, event?: React.MouseEvent) => {
        event?.stopPropagation(); // ✅ Prevent selection when clicking Edit
        setEditingAddressId(addressId || null);
        setEditorOpen(true);
    };

    // ✅ **Delete Address**
    const handleDelete = async () => {
        if (deleteAddressId === null) return;

        await addressService.deleteAddress(deleteAddressId);
        await fetchUser();

        // ✅ If deleted address was selected, reset it
        if (selectedAddress?.id === deleteAddressId) {
            localStorage.removeItem("selected_address");
            setSelectedAddress(null);
        }

        setDeleteModalOpen(false);
        setDeleteAddressId(null);
    };

    return (
        <>
            <Modal isDismissable={false} isOpen={isOpen} onOpenChange={onClose}  scrollBehavior="inside" size="lg" >
                <ModalContent className="rounded-t-2xl bg-white shadow-lg ">
                    <ModalHeader className="flex items-center justify-between p-4">
                        <h2 className="text-lg font-bold text-gray-900">Where should we deliver your order?</h2>
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
  className="w-full  min-h-[2.7rem] h-12 flex items-center justify-center gap-2 rounded-lg border-primary text-primary font-medium text-sm"
  onPress={handleUseCurrentLocation}
  isLoading={loadingLocation}
>
  <MapPin className="text-primary w-5 h-5" />
  Use my current location
</Button>

                        {/* 📍 Saved Addresses List */}
                        <div className="space-y-2">
                            {user?.addresses?.map((address) => (
                                <div
                                    key={address.id}
                                    className={`flex items-center justify-between p-3 border rounded-lg transition hover:shadow-md cursor-pointer ${
                                        address.id === selectedAddress?.id ? "border-primary bg-primary/10" : "border-gray-300"
                                    }`}
                                    onClick={(event) => handleSetDefault(address, event)}
                                >
                                    <div>
                                        <p className="font-semibold">{address.label}</p>
                                        <p className="text-sm text-gray-600">{address.address}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* ✏ Edit (Prevents Selection) */}
                                        <button onClick={(event) => openEditor(address.id, event)}>
                                            <Pencil className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                                        </button>

                                        {/* ❌ Delete (Prevents Selection) */}
                                        <button onClick={(event) => {
                                            event.stopPropagation(); // ✅ Prevents selection when deleting
                                            setDeleteAddressId(address.id);
                                            setDeleteModalOpen(true);
                                        }}>
                                            <Trash className="w-4 h-4 text-red-500 hover:text-red-700" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

         


                    </ModalBody>
                    <ModalFooter >               {/* ➕ Add New Address */}
                   <Button
  variant="ghost"
  className="w-full min-h-[2.8rem] flex items-center justify-center gap-2 text-primary font-medium text-sm rounded-lg hover:bg-primary/10"
  onPress={() => openEditor()}
>
  <Plus className="w-5 h-5" />
  Add a new address
</Button></ModalFooter>
                </ModalContent>
            </Modal>

            {/* 📍 Address Editor Modal */}
            {editorOpen && (
                <AddressEditorModal isOpen={editorOpen} onClose={() => setEditorOpen(false)} addressId={editingAddressId} />
            )}

            {/* ❗ Alert Modal for Deleting Address */}
            <AlertModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Address"
                message="Are you sure you want to delete this address? This action cannot be undone."
                type="warning"
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    );
}
