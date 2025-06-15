"use client";
import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@heroui/react";
import { MapPin, X, Pencil } from "lucide-react";
import { useUser } from "@/context/userContext";
import { googleMapsService } from "@/services/googleMapsService";
import { addressService } from "@/services/addressService";

interface AddressSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddressSelector({ isOpen, onClose }: AddressSelectorProps) {
    const { user, fetchUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(user?.default_address || "Fetching location...");
    const [newAddress, setNewAddress] = useState({
        label: "Home",
        address: "",
        latitude: null,
        longitude: null,
        notes: "",
    });

    useEffect(() => {
        if (isOpen) {
            if (!window.google?.maps) {
                loadGoogleMaps();
            } else {
                initMap();
            }
        }
    }, [isOpen]);

    const loadGoogleMaps = () => {
        if (!document.querySelector("script[src*='maps.googleapis.com']")) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => initMap();
            document.head.appendChild(script);
        }
    };

    const initMap = () => {
        if (!window.google?.maps) return;
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                updateAddressFromCoords(latitude, longitude);
            },
            () => console.error("Location permission denied.")
        );

        const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
            center: { lat: 14.5995, lng: 120.9842 },
            zoom: 16,
            disableDefaultUI: true,
        });

        const marker = new google.maps.Marker({
            position: map.getCenter(),
            map,
            draggable: true,
        });

        marker.addListener("dragend", async () => {
            const lat = marker.getPosition()?.lat();
            const lng = marker.getPosition()?.lng();
            if (lat && lng) {
                updateAddressFromCoords(lat, lng);
            }
        });
    };

    const updateAddressFromCoords = async (lat: number, lng: number) => {
        const address = await googleMapsService.getAddressFromCoords(lat, lng);
        setSelectedAddress(address || "Unknown Location");
        setNewAddress({ ...newAddress, latitude: lat, longitude: lng, address: address || "Unknown Location" });
    };

    const handleSaveAddress = async () => {
        const response = await addressService.addAddress(newAddress);
        if (response.success) {
            fetchUser();
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} >
            <ModalContent>
                <ModalHeader className="flex items-center justify-between p-4 bg-white shadow">
                    <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </ModalHeader>

                <ModalBody className="p-0 relative">
                    <div id="map" className="w-full h-[40vh] bg-gray-200"></div>
                </ModalBody>

                <div className="p-4 bg-white border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="text-primary w-5 h-5" />
                            <p className="text-sm font-semibold">{selectedAddress}</p>
                        </div>
                        <button onClick={() => setIsEditing(true)} className="text-primary text-sm flex items-center">
                            <Pencil className="w-4 h-4 mr-1" /> Edit
                        </button>
                    </div>
                    {isEditing && (
                        <div className="mt-3 flex flex-col gap-3">
                            <Input placeholder="Floor" value={newAddress.notes} onChange={(e) => setNewAddress({ ...newAddress, notes: e.target.value })} />
                            <Textarea placeholder="Note to rider - e.g. building, landmark" rows={2} />
                        </div>
                    )}
                    <div className="mt-4 flex gap-2">
                        {['Home', 'Work', 'Partner', 'Other'].map((label) => (
                            <Button key={label} variant={newAddress.label === label ? "solid" : "outline"} onPress={() => setNewAddress({ ...newAddress, label })}>
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>
                <ModalFooter className="p-4 bg-white border-t">
                    <Button className="bg-primary text-white w-full" onPress={handleSaveAddress}>SUBMIT</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
