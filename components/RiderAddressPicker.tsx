"use client";
import { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import { googleMapsService } from "@/services/googleMapsService";
import { IoLocationOutline } from "react-icons/io5";
import { LocateFixed } from "lucide-react";


const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = { lat: 14.5995, lng: 120.9842 }; // Manila Default

export default function RiderAddressPicker({ isOpen, onClose, onSelect }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (address: string, lat: number, lng: number) => void; 
}) {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [formattedAddress, setFormattedAddress] = useState("Fetching location...");
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAPS_API_KEY || "", libraries: ["places"] });

  const autocompleteRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (isOpen) {
      // ✅ Load last selected location when opening
      const savedLocation = localStorage.getItem("rider_location");
      if (savedLocation) {
        const { address, lat, lng } = JSON.parse(savedLocation);
        updateLocation(lat, lng, address);
      } else {
        getCurrentLocation(); // Default to current location
      }
      loadAutocomplete();
    }
  }, [isOpen]);

  // ✅ Get Current Location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateLocation(lat, lng);
      }, () => {
        setFormattedAddress("Location permission denied");
      });
    }
  };

  // ✅ Handle Marker Drag
  const handleMarkerDragEnd = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      updateLocation(lat, lng);
    }
  };

  // ✅ Load Google Maps Autocomplete
  const loadAutocomplete = () => {
    if (autocompleteRef.current && window.google?.maps) {
      const autocomplete = new google.maps.places.Autocomplete(autocompleteRef.current, {
        types: ["geocode"],
        componentRestrictions: { country: "PH" },
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          updateLocation(lat, lng, place.formatted_address);
        }
      });
    }
  };

  // ✅ Update Location (Used for Search, Drag & Current Location)
  const updateLocation = async (lat: number, lng: number, address?: string) => {
    setMarkerPosition({ lat, lng });
    setMapCenter({ lat, lng });

    // If address is not provided, fetch it from Google Maps
    const resolvedAddress = address || await googleMapsService.getAddressFromCoords(lat, lng);
    setFormattedAddress(resolvedAddress || "Unknown Address");

    // Save to local storage
    localStorage.setItem("rider_location", JSON.stringify({ address: resolvedAddress, lat, lng }));
  };

  // ✅ Save Selected Address
  const handleSave = () => {
    onSelect(formattedAddress, markerPosition.lat, markerPosition.lng);
    onClose();
  };

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="md" isDismissable={false}>
      <ModalContent>
        <ModalHeader className="flex justify-between p-4">
          <h2 className="text-lg font-bold">Set Your Delivery Location</h2>
        </ModalHeader>
        <ModalBody className="p-4">
          {/* 📍 Address Search Input */}
          <Input ref={autocompleteRef} placeholder="Search for an address..." className="mb-3" />

          {/* Google Map */}
          <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={15}>
            <Marker position={markerPosition} draggable onDragEnd={handleMarkerDragEnd} />
          </GoogleMap>

          {/* 📍 Selected Address Display */}
          <Input readOnly value={formattedAddress} className="mt-3" />
        </ModalBody>
        <ModalFooter className="p-4 flex justify-between">
          <Button className="bg-gray-300" onPress={onClose}>Cancel</Button>
          {/* ✅ New "Use Current Location" Button */}
          <Button className="bg-secondary text-white flex items-center" onPress={getCurrentLocation}>
            <IoLocationOutline className="mr-2" /> 
          </Button>
          <Button className="bg-primary text-white" onPress={handleSave}>Set Location</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
