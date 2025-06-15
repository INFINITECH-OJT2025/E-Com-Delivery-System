"use client";

import { useEffect, useRef } from "react";
import { Input } from "@heroui/react";
import { googleMapsService } from "@/services/googleMapsService";

interface Props {
  isEditing: boolean;
  restaurant: any;
  onChange: (key: string, value: any) => void;
}

export default function RestaurantLocationForm({
  isEditing,
  restaurant,
  onChange,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadGoogleMaps();
  }, [isEditing]);

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
    if (!restaurant.latitude || !restaurant.longitude) return;

    const center = {
      lat: parseFloat(restaurant.latitude),
      lng: parseFloat(restaurant.longitude),
    };

    mapInstance.current = new window.google.maps.Map(mapRef.current!, {
      center,
      zoom: 15,
      disableDefaultUI: true,
    });

    markerRef.current = new window.google.maps.Marker({
      position: center,
      map: mapInstance.current,
      draggable: isEditing,
    });

    if (isEditing) {
      markerRef.current.addListener("dragend", async () => {
        const lat = markerRef.current!.getPosition()!.lat();
        const lng = markerRef.current!.getPosition()!.lng();
        const address = await googleMapsService.getAddressFromCoords(lat, lng);
        onChange("latitude", lat);
        onChange("longitude", lng);
        onChange("address", address || "Unknown Location");
      });
    }

    if (autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "PH" },
        }
      );

      if (isEditing) {
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const formatted = place.formatted_address;

            markerRef.current?.setPosition({ lat, lng });
            mapInstance.current?.setCenter({ lat, lng });

            onChange("latitude", lat);
            onChange("longitude", lng);
            onChange("address", formatted || "");
          }
        });
      }
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Title */}
      <div>
      <h2 className="text-2xl font-bold">Location Information</h2>
        <p className="text-sm text-gray-500">
          Set your restaurant's physical location and adjust the map pin.
        </p>
      </div>

      <Input
        label="Search Location"
        ref={autocompleteRef}
        placeholder="Search for your restaurant address"
        isDisabled={!isEditing}
      />

      <div
        ref={mapRef}
        className="w-full h-[300px] bg-gray-200 rounded-lg shadow"
      />

      <Input
        label="Address"
        name="address"
        value={restaurant.address || ""}
        onChange={(e) => onChange("address", e.target.value)}
        isDisabled={!isEditing}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Latitude"
          name="latitude"
          value={restaurant.latitude?.toString() || ""}
          onChange={(e) => onChange("latitude", e.target.value)}
          isDisabled={!isEditing}
        />
        <Input
          label="Longitude"
          name="longitude"
          value={restaurant.longitude?.toString() || ""}
          onChange={(e) => onChange("longitude", e.target.value)}
          isDisabled={!isEditing}
        />
      </div>
    </div>
  );
}
