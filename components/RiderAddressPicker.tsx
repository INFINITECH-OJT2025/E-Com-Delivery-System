"use client";
import { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input
} from "@heroui/react";
import { googleMapsService } from "@/services/googleMapsService";
import { IoLocationOutline } from "react-icons/io5";
import { FaMapMarkerAlt } from "react-icons/fa";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = { lat: 14.5995, lng: 120.9842 }; // Manila Default

export default function RiderAddressPicker({ onSelect }: { 
  onSelect: (address: string, lat: number, lng: number) => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [formattedAddress, setFormattedAddress] = useState("Fetching location...");
  const autocompleteRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const savedLocation = localStorage.getItem("rider_location");
      if (savedLocation) {
        const { address, lat, lng } = JSON.parse(savedLocation);
        updateLocation(lat, lng, address);
      } else {
        getCurrentLocation();
      }
      loadAutocomplete();
    }
  }, [isOpen]);

  // ✅ Get Current Location (GPS)
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
    setIsOpen(false);
  };

  return (
    <>
      {/* ✅ Location Selector Button (Click to Open Modal) */}
      <div
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer bg-secondary text-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
      >
        <FaMapMarkerAlt className="text-white text-xl flex-shrink-0" />
        <p className="text-base font-semibold truncate flex-1">{formattedAddress}</p>
        <span className="text-sm font-semibold underline">Change</span>
      </div>

      {/* ✅ Location Picker Modal */}
      <Modal isOpen={isOpen} onOpenChange={setIsOpen} size="md" isDismissable={false}>
        <ModalContent>
          <ModalHeader className="flex justify-between p-4">
            <h2 className="text-lg font-bold">Set Your Delivery Location</h2>
          </ModalHeader>
          <ModalBody className="p-4">
            {/* 📍 Address Search Input */}
            <Input ref={autocompleteRef} placeholder="Search for an address..." className="mb-3" />

            {/* Google Map - Uses Global GoogleMapsProvider */}
            <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={15}>
              <Marker position={markerPosition} draggable onDragEnd={handleMarkerDragEnd} />
            </GoogleMap>

            {/* 📍 Selected Address Display */}
            <Input readOnly value={formattedAddress} className="mt-3" />
          </ModalBody>
          <ModalFooter className="p-4 flex justify-between">
            <Button className="bg-gray-300" onPress={() => setIsOpen(false)}>Cancel</Button>
            <Button className="bg-secondary text-white flex items-center" onPress={getCurrentLocation}>
              <IoLocationOutline className="mr-2" /> Use My Location
            </Button>
            <Button className="bg-primary text-white" onPress={handleSave}>Set Location</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
