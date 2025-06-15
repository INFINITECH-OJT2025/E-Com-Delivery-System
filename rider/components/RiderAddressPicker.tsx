"use client";

import { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
} from "@heroui/react";
import { googleMapsService } from "@/services/googleMapsService";
import { IoLocateOutline } from "react-icons/io5";
import { FaMapMarkerAlt } from "react-icons/fa";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = { lat: 14.5995, lng: 120.9842 }; // Manila default

export default function RiderAddressPicker({ onSelect }: {
  onSelect: (address: string, lat: number, lng: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [formattedAddress, setFormattedAddress] = useState("Fetching location...");
  const [isMapLoading, setIsMapLoading] = useState(false);
  const autocompleteRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedLocation = localStorage.getItem("rider_location");
    if (savedLocation) {
      const { address, lat, lng } = JSON.parse(savedLocation);
      updateLocation(lat, lng, address);
    } else {
      getCurrentLocation();
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadAutocomplete();
  }, [isOpen]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updateLocation(lat, lng);
      }, () => setFormattedAddress("Location permission denied"));
    }
  };

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

  const updateLocation = async (lat: number, lng: number, address?: string) => {
    setMapCenter({ lat, lng });
    setMarkerPosition({ lat, lng });

    const resolved = address || await googleMapsService.getAddressFromCoords(lat, lng);
    setFormattedAddress(resolved || "Unknown Address");

    localStorage.setItem("rider_location", JSON.stringify({ address: resolved, lat, lng }));
  };

  const handleSave = () => {
    onSelect(formattedAddress, markerPosition.lat, markerPosition.lng);
    setIsOpen(false);
  };

  return (
    <>
      {/* Current Location Preview */}
      <div
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow-md border hover:shadow-lg cursor-pointer transition"
      >
        <div className="bg-primary p-2 rounded-full text-white">
          <FaMapMarkerAlt className="text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-medium">Current Location</p>
          <p className="text-sm font-semibold truncate">{formattedAddress}</p>
        </div>
        <span className="text-sm font-medium text-primary underline">Change</span>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        scrollBehavior="inside"
        size="xl"
        hideCloseButton={true}
        isDismissable={false}
      >
        <ModalContent >
          {/* Updated Modal Header with bg-primary */}
          <ModalHeader className="p-4 border-b bg-primary text-white text-center shadow-sm rounded-t-xl relative">
  <h3 className="text-lg font-bold">📍 Set Delivery Location</h3>

  <button
    onClick={() => setIsOpen(false)}
    className="absolute right-4 top-4 text-white text-sm hover:opacity-80"
  >
    ✖
  </button>
</ModalHeader>

          <ModalBody className="p-4 space-y-3">
            <Input
              ref={autocompleteRef}
              placeholder="Type to search..."
              className="placeholder:text-sm placeholder:text-gray-400"
            />

            {isMapLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" />
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={15}
              >
                <Marker
                  position={markerPosition}
                  draggable
                  onDragEnd={(e) => {
                    if (e.latLng) {
                      const lat = e.latLng.lat();
                      const lng = e.latLng.lng();
                      updateLocation(lat, lng);
                    }
                  }}
                />
              </GoogleMap>
            )}

            <Input
              readOnly
              value={formattedAddress}
              className="text-sm text-gray-700 font-medium bg-gray-100"
            />
          </ModalBody>

          <ModalFooter className="p-4 flex flex-col  gap-2 ">
            <Button variant="ghost" className="w-full sm:w-auto" onPress={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-danger text-white w-full sm:w-auto"
              onPress={getCurrentLocation}
            >
              <IoLocateOutline className="mr-2 text-white" /> Current Location
            </Button>
            <Button className="bg-primary text-white w-full sm:w-auto" onPress={handleSave}>
              Confirm Location
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
