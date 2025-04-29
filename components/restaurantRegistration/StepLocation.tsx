"use client";

import { Input, Button } from "@heroui/react";
import { useVendorRegister } from "./VendorRegisterContext";
import { MapPin, LocateFixed } from "lucide-react";
import { useEffect, useRef } from "react";
import { googleMapsService } from "@/services/googleMapsService";

interface Props {
  fieldErrors: Record<string, string>; // ✅ proper props
}

export default function StepLocation({ fieldErrors }: Props) { // ✅ accepts props
  const { formData, updateFormData } = useVendorRegister();

  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  const loadGoogleMaps = () => {
    if (window.google?.maps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap();
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current) return;

    const center = {
      lat: formData.latitude || 14.5995,
      lng: formData.longitude || 120.9842,
    };

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      disableDefaultUI: true,
    });

    markerRef.current = new window.google.maps.Marker({
      position: center,
      map: mapInstance.current,
      draggable: true,
    });

    markerRef.current.addListener("dragend", handleMarkerDrag);

    if (autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        types: ["geocode"],
        componentRestrictions: { country: "PH" },
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || "";

          markerRef.current?.setPosition({ lat, lng });
          mapInstance.current?.setCenter({ lat, lng });

          updateFormData("latitude", lat);
          updateFormData("longitude", lng);
          updateFormData("restaurant_address", address);
        }
      });
    }
  };

  const handleMarkerDrag = async () => {
    const lat = markerRef.current?.getPosition()?.lat();
    const lng = markerRef.current?.getPosition()?.lng();
    if (lat && lng) {
      const address = await googleMapsService.getAddressFromCoords(lat, lng);
      updateFormData("latitude", lat);
      updateFormData("longitude", lng);
      updateFormData("restaurant_address", address || "Unknown location");
    }
  };

  const detectMyLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      markerRef.current?.setPosition({ lat, lng });
      mapInstance.current?.setCenter({ lat, lng });

      const address = await googleMapsService.getAddressFromCoords(lat, lng);
      updateFormData("latitude", lat);
      updateFormData("longitude", lng);
      updateFormData("restaurant_address", address || "Unknown location");
    });
  };

  return (
    <div className="space-y-8">

      {/* Section Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Location Information</h2>
        <p className="text-sm text-gray-500">
          Provide your restaurant’s address and location details. This will help customers find your restaurant.
        </p>
      </div>

      {/* Address Input */}
      <Input
        label="Restaurant Address"
        labelPlacement="outside"
        placeholder="123 Main Street, City, State, ZIP"
        value={formData.restaurant_address}
        ref={autocompleteRef}
        onChange={(e) => updateFormData("restaurant_address", e.target.value)}
                   isInvalid={!!fieldErrors.name}         // ✅ this is missing in your code

        errorMessage={fieldErrors.restaurant_address}
      />

      {/* Latitude and Longitude */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Latitude"
          labelPlacement="outside"
          placeholder="Latitude"
          value={formData.latitude?.toString() || ""}
          onChange={(e) => updateFormData("latitude", parseFloat(e.target.value))}
                     isInvalid={!!fieldErrors.name}         // ✅ this is missing in your code

          errorMessage={fieldErrors.latitude}
        />
        <Input
          label="Longitude"
          labelPlacement="outside"
          placeholder="Longitude"
          value={formData.longitude?.toString() || ""}
          onChange={(e) => updateFormData("longitude", parseFloat(e.target.value))}
                     isInvalid={!!fieldErrors.name}         // ✅ this is missing in your code

          errorMessage={fieldErrors.longitude}
        />
      </div>

      {/* Map Section */}
      <div className="space-y-4">
        <div className="flex items-center text-sm text-gray-600 gap-2">
          <MapPin className="w-5 h-5" />
          Don't know your coordinates? Use the map below or click "Detect My Location".
        </div>

        <div ref={mapRef} className="w-full h-72 bg-gray-200 rounded-lg shadow-md" />

        <Button
          onClick={detectMyLocation}
          startContent={<LocateFixed className="w-4 h-4" />}
          className="w-full"
          variant="ghost"
        >
          Detect My Location
        </Button>
      </div>

    </div>
  );
}
