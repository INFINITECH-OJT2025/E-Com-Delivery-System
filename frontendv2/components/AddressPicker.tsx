"use client";
import { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@heroui/react";
import { MapPin, Edit, X } from "lucide-react";
import { googleMapsService } from "@/services/googleMapsService";
import { addressService } from "@/services/addressService";
import { useUser } from "@/context/userContext";

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
    width: "100%",
    height: "250px",
};

const defaultCenter = { lat: 14.5995, lng: 120.9842 }; // Default to Manila

export default function AddressPicker({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user, fetchUser } = useUser();
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = useState(defaultCenter);
    const [formattedAddress, setFormattedAddress] = useState("Fetching location...");
    const [label, setLabel] = useState("Home");
    const [notes, setNotes] = useState("");

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: MAPS_API_KEY || "",
    });

    // 🌍 Get Current Location on Load
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                setMapCenter({ lat: latitude, lng: longitude });
                setMarkerPosition({ lat: latitude, lng: longitude });
                const address = await googleMapsService.getAddressFromCoords(latitude, longitude);
                setFormattedAddress(address || "Unknown Address");
            });
        }
    }, []);

    // 📍 When Marker is Dragged, Update Address
    const handleMarkerDragEnd = async (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            setMarkerPosition({ lat: newLat, lng: newLng });
            const address = await googleMapsService.getAddressFromCoords(newLat, newLng);
            setFormattedAddress(address || "Unknown Address");
        }
    };

    // ✅ Save Address
    const handleSaveAddress = async () => {
        const response = await addressService.addAddress({
            label,
            address: formattedAddress,
            latitude: markerPosition.lat,
            longitude: markerPosition.lng,
            notes,
        });

        if (response.success) {
            fetchUser();
            onClose();
        }
    };

    if (!isLoaded) return <p>Loading map...</p>;

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="bottom" size="md">
            <ModalContent>
                <ModalHeader className="flex items-center justify-between p-4">
                    <h2 className="text-lg font-bold text-gray-900">Set Delivery Location</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </ModalHeader>

                <ModalBody className="p-4">
                    {/* 🗺 Google Map with Draggable Pin */}
                    <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={15}>
                        <Marker position={markerPosition} draggable onDragEnd={handleMarkerDragEnd} />
                    </GoogleMap>

                    {/* 📍 Address Details */}
                    <div className="mt-3">
                        <Input readOnly value={formattedAddress} />
                        <Textarea placeholder="Notes for rider" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-2" />
                    </div>
                </ModalBody>

                <ModalFooter className="p-4 flex justify-between">
                    <Button className="bg-gray-300 text-gray-700" onPress={onClose}>Cancel</Button>
                    <Button className="bg-primary text-white" onPress={handleSaveAddress}>Save Address</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
