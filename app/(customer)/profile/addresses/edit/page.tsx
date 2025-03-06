"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Input, Textarea, Checkbox } from "@heroui/react";
import { MapPin, Building, Briefcase } from "lucide-react";
import { googleMapsService } from "@/services/googleMapsService";
import { addressService } from "@/services/addressService";

export default function AddressEditorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const addressId = searchParams.get("addressId");

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
    const [googleLoaded, setGoogleLoaded] = useState(false);

    // 📍 Load Current Location as Default
    useEffect(() => {
        if (!addressId) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const address = await googleMapsService.getAddressFromCoords(lat, lng);
                    setForm((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                        address: address || "Unknown Location",
                    }));
                },
                () => console.error("Geolocation permission denied or unavailable")
            );
        }
    }, []);

    // 📍 Load Existing Address (if editing)
    useEffect(() => {
        if (addressId) fetchExistingAddress();
        loadGoogleMaps();
    }, [addressId]);

    const fetchExistingAddress = async () => {
        const address = await addressService.getAddressById(Number(addressId));
        if (address) {
            setForm((prev) => ({
                ...prev,
                label: address.label,
                address: address.address,
                latitude: address.latitude,
                longitude: address.longitude,
                notes: address.notes || "",
                is_default: address.is_default,
            }));
        }
    };

    // 📍 Load Google Maps API
    const loadGoogleMaps = () => {
        if (!document.querySelector("script[src*='maps.googleapis.com']")) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setGoogleLoaded(true);
                initMap();
            };
            document.head.appendChild(script);
        } else {
            setGoogleLoaded(true);
            initMap();
        }
    };

    // 📍 Initialize Google Maps & Autocomplete
    const initMap = () => {
        if (!window.google?.maps) return;

        const center = { lat: form.latitude || 14.5995, lng: form.longitude || 120.9842 };

        const map = new google.maps.Map(mapRef.current, {
            center,
            zoom: 16,
            streetViewControl: false,
            disableDefaultUI: true,
        });

        const marker = new google.maps.Marker({
            position: center,
            map,
            draggable: true,
        });

        markerRef.current = marker;

        // 📍 Update Address When Marker Moves
        google.maps.event.addListener(marker, "dragend", async () => {
            const lat = marker.getPosition()?.lat();
            const lng = marker.getPosition()?.lng();
            if (lat && lng) {
                const address = await googleMapsService.getAddressFromCoords(lat, lng);
                setForm((prev) => ({ ...prev, latitude: lat, longitude: lng, address: address || "Unknown Location" }));
            }
        });

        // 🔍 Enable Google Maps Autocomplete
        if (autocompleteRef.current) {
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

                    // Move marker & map
                    marker.setPosition({ lat, lng });
                    map.setCenter({ lat, lng });
                }
            });
        }
    };

    // ✅ Save Address (Add or Update)
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

        if (addressId) {
            await addressService.updateAddress(Number(addressId), addressData);
            router.push("/home"); // Redirect back to the addresses list
        } else {
            await addressService.addAddress(addressData);
        }
        setLoading(false);
    };

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-lg font-bold">{addressId ? "Edit Address" : "Add New Address"}</h2>

            {/* 📍 Google Maps (Fixed Height) */}
            <div ref={mapRef} className="w-full h-[300px] bg-gray-200 rounded-lg"></div>

            {/* 📍 Selected Address Display */}
            <div className="flex items-start gap-2 mt-2 p-3 bg-gray-100 rounded-lg shadow">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                    <p className="text-base font-semibold">{form.address || "No address selected"}</p>
                    <p className="text-sm text-gray-600">{form.address ? "Move the pin to adjust location" : "Use search or move the pin"}</p>
                </div>
            </div>

            {/* 📍 Address Search Input (Autocomplete) */}
            <Input
                label="Search Address"
                placeholder="Type your address"
                ref={autocompleteRef}
                className="mt-4"
            />

            {/* 📍 Address Label Selection (Compact Badges/Chips) */}
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
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}/>

            {/* ✅ Save Address Button */}
            <Button className="w-full bg-primary text-white mt-4" isLoading={loading} onPress={handleSaveAddress}>
                {addressId ? "Update Address" : "Save Address"}
            </Button>
        </div>
    );
}
