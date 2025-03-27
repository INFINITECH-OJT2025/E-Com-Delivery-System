"use client";
import { useEffect, useState, useRef } from "react";
import { googleMapsService } from "@/services/googleMapsService";
import { addressService } from "@/services/addressService";
import { useUser } from "@/context/userContext";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Checkbox } from "@heroui/react";
import { MapPin, Building, Briefcase, X } from "lucide-react";

interface AddressEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    addressId?: number | null;
}

export default function AddressEditorModal({ isOpen, onClose, addressId }: AddressEditorModalProps) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        label: "Home",
        address: "",
        latitude: null,
        longitude: null,
        notes: "",
        is_default: false,
    });

    const autocompleteRef = useRef<HTMLInputElement | null>(null);
    const mapRef = useRef<HTMLDivElement | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const { fetchUser, setSelectedAddress } = useUser();

    // ✅ **Load Address Data when Modal Opens**
    useEffect(() => {
        if (isOpen) {
            if (addressId) {
                fetchExistingAddress();
            } else {
                getCurrentLocation();
            }
            loadGoogleMaps();
        }
    }, [isOpen, addressId]);

    // ✅ **Fetch Existing Address for Editing**
    const fetchExistingAddress = async () => {
        try {
            const response = await addressService.getAddressById(Number(addressId));

            if (response?.data) {
                const address = response.data;

                setForm({
                    label: address.label,
                    address: address.address,
                    latitude: parseFloat(address.latitude),
                    longitude: parseFloat(address.longitude),
                    notes: address.notes || "",
                    is_default: address.is_default,
                });

                // ✅ Wait for Google Maps to load before setting center
                if (mapInstance.current && markerRef.current) {
                    const newPosition = { lat: parseFloat(address.latitude), lng: parseFloat(address.longitude) };
                    markerRef.current.setPosition(newPosition);
                    mapInstance.current.setCenter(newPosition);
                }
            }
        } catch (error) {
            console.error("Failed to fetch address:", error);
        }
    };

    // ✅ **Get Current Location for Adding New Address**
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const address = await googleMapsService.getAddressFromCoords(lat, lng);

                setForm({
                    label: "Home",
                    address: address || "Unknown Location",
                    latitude: lat,
                    longitude: lng,
                    notes: "",
                    is_default: false,
                });

                // ✅ Update map and marker position
                if (mapInstance.current && markerRef.current) {
                    const newPosition = { lat, lng };
                    markerRef.current.setPosition(newPosition);
                    mapInstance.current.setCenter(newPosition);
                }
            },
            () => console.error("Geolocation permission denied or unavailable")
        );
    };

    // ✅ **Load Google Maps API**
    const loadGoogleMaps = () => {
        if (window.google?.maps) {
            initMap();
            return;
        }

        if (!document.querySelector("script[src*='maps.googleapis.com']")) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                initMap();
            };
            document.head.appendChild(script);
        }
    };

    // ✅ **Initialize Google Maps & Autocomplete**
    const initMap = () => {
        if (!window.google?.maps || !mapRef.current) return;

        const center = { lat: form.latitude || 14.5995, lng: form.longitude || 120.9842 };

        // ✅ Store map instance
        mapInstance.current = new google.maps.Map(mapRef.current, {
            center,
            zoom: 16,
            streetViewControl: false,
            disableDefaultUI: true,
        });

        // ✅ Create and store marker instance
        markerRef.current = new google.maps.Marker({
            position: center,
            map: mapInstance.current,
            draggable: true,
        });

        // ✅ Update Address When Marker Moves
        google.maps.event.addListener(markerRef.current, "dragend", async () => {
            const lat = markerRef.current?.getPosition()?.lat();
            const lng = markerRef.current?.getPosition()?.lng();
            if (lat && lng) {
                const address = await googleMapsService.getAddressFromCoords(lat, lng);
                setForm((prev) => ({ ...prev, latitude: lat, longitude: lng, address: address || "Unknown Location" }));
            }
        });

        // ✅ Enable Google Maps Autocomplete
        if (autocompleteRef.current && window.google?.maps?.places?.Autocomplete) {
            const autocomplete = new google.maps.places.Autocomplete(autocompleteRef.current, {
                types: ["geocode"],
                componentRestrictions: { country: "PH" },
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (place.geometry) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    setForm((prev) => ({ ...prev, latitude: lat, longitude: lng, address: place.formatted_address }));

                    // ✅ Move marker & map
                    markerRef.current?.setPosition({ lat, lng });
                    mapInstance.current?.setCenter({ lat, lng });
                }
            });
        }
    };

  // ✅ **Save Address (Add or Update)**
const handleSaveAddress = async () => {
    setLoading(true);
    const addressData = {
        label: form.label,
        address: form.address,
        latitude: form.latitude,
        longitude: form.longitude,
        notes: form.notes,
        is_default: form.is_default,
    };

    try {
        let response;
        if (addressId) {
            response = await addressService.updateAddress(Number(addressId), addressData);
        } else {
            response = await addressService.addAddress(addressData);
            setSelectedAddress(response.data); // ✅ Update selected address globally when adding a new one
            await fetchUser(); // ✅ Fetch user only when adding a new address
        }

        onClose();
    } catch (error) {
        console.error("Failed to save address:", error);
    } finally {
        setLoading(false);
    }
};



    // 🔻 **STOP HERE FOR NOW - RETURN STATEMENT IN NEXT MESSAGE**
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} scrollBehavior="inside" size="full" isDismissable={false}>
            <ModalContent className="rounded-lg bg-white shadow-lg">
                
                {/* 📍 Modal Header with Divider */}
                <ModalHeader className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold">{addressId ? "Edit Address" : "Add New Address"}</h2>
                  
                </ModalHeader>
    
                <ModalBody className="p-4 space-y-4">
                    {/* 📍 Google Maps */}
                    <div ref={mapRef} className="w-full h-[300px] bg-gray-200 rounded-lg shadow"></div>
    
                    {/* 📍 Selected Address Display */}
                    <div className="flex items-start gap-2 p-3 bg-gray-100 rounded-lg shadow">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-base font-semibold">{form.address || "No address selected"}</p>
                            <p className="text-sm text-gray-600">
                                {form.address ? "Move the pin to adjust location" : "Use search or move the pin"}
                            </p>
                        </div>
                    </div>
    
                    {/* 📍 Address Search Input */}
                    <Input
                        label="Search Address"
                        placeholder="Type your address"
                        ref={autocompleteRef}
                        className="mt-4"
                    />
    
                    {/* 📍 Address Label Selection */}
                    <div className="flex gap-2 mt-3">
                        {[
                            { label: "Home", icon: <Building />, value: "Home" },
                            { label: "Work", icon: <Briefcase />, value: "Work" },
                            { label: "Other", icon: <MapPin />, value: "Other" },
                        ].map((option) => (
                            <button
                                key={option.value}
                                className={`inline-flex items-center px-3 py-1.5 text-xs rounded-full border ${
                                    form.label === option.value ? "border-primary bg-primary text-white" : "border-gray-300"
                                }`}
                                onClick={() => setForm((prev) => ({ ...prev, label: option.value }))}
                            >
                                <span className="mr-1">{option.icon}</span>
                                {option.label}
                            </button>
                        ))}
                    </div>
    
                    {/* ✅ Default Address Checkbox */}
                    <Checkbox
                        size="sm"
                        checked={form.is_default}
                        onChange={(e) => setForm((prev) => ({ ...prev, is_default: e.target.checked }))}
                    >
                        Set as Default Address
                    </Checkbox>
    
                    {/* ✍ Notes Input */}
                    <Textarea
                        label="Notes (e.g., floor, landmark)"
                        placeholder="Add delivery notes"
                        rows={2}
                        value={form.notes}
                        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    />
                </ModalBody>
    
                {/* 📍 Modal Footer with Divider */}
                <ModalFooter className="border-t border-gray-200 p-4">
                    <Button className="w-full bg-primary text-white" isLoading={loading} onPress={handleSaveAddress}>
                        {addressId ? "Update Address" : "Save Address"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}    