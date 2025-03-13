"use client";

import { useEffect, useRef, useState } from "react";
import { useVendorAuth } from "@/context/VendorAuthContext";
import { googleMapsService } from "@/services/googleMapsService";
import { Button, Card, CardBody, Form, Input, Textarea } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { MapPin, Briefcase, Building } from "lucide-react";

export default function VendorRegister() {
  const { register } = useVendorAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
    restaurant_name: "",
    restaurant_address: "",
    restaurant_phone: "",
    latitude: null,
    longitude: null,
  });

  const autocompleteRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);

  // ✅ **Load Google Maps & Get Current Location on Component Mount**
  useEffect(() => {
    loadGoogleMaps();
    getCurrentLocation();
  }, []);

  // ✅ **Fetch Current Location & Set as Default**
  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const address = await googleMapsService.getAddressFromCoords(lat, lng);
      setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng, restaurant_address: address || "Unknown Location" }));
      if (mapInstance.current && markerRef.current) {
        const newPosition = { lat, lng };
        markerRef.current.setPosition(newPosition);
        mapInstance.current.setCenter(newPosition);
      }
    });
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
      script.onload = () => initMap();
      document.head.appendChild(script);
    }
  };

  // ✅ **Initialize Google Maps & Autocomplete**
  const initMap = () => {
    if (!window.google?.maps || !mapRef.current) return;
    const center = { lat: formData.latitude || 14.5995, lng: formData.longitude || 120.9842 };

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 16,
      streetViewControl: false,
      disableDefaultUI: true,
    });

    markerRef.current = new google.maps.Marker({
      position: center,
      map: mapInstance.current,
      draggable: true,
    });

    google.maps.event.addListener(markerRef.current, "dragend", async () => {
      const lat = markerRef.current?.getPosition()?.lat();
      const lng = markerRef.current?.getPosition()?.lng();
      if (lat && lng) {
        const address = await googleMapsService.getAddressFromCoords(lat, lng);
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng, restaurant_address: address || "Unknown Location" }));
      }
    });

    if (autocompleteRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(autocompleteRef.current, { types: ["geocode"], componentRestrictions: { country: "PH" } });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng, restaurant_address: place.formatted_address }));
          markerRef.current?.setPosition({ lat, lng });
          mapInstance.current?.setCenter({ lat, lng });
        }
      });
    }
  };

  // ✅ **Handle Input Changes**
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") setPassword(value);
  };

  // ✅ **Handle Registration**
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      addToast({ title: "Registration Successful", description: "Please verify your email.", color: "success" });
      router.push("/vendor/login");
    } catch {
      addToast({ title: "Registration Failed", description: "Please check your details.", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center ">
      <Card className="w-full max-w-screen-lg shadow-lg p-6">
        <CardBody>
          <h2 className="text-2xl font-bold text-center mb-6">Vendor Registration</h2>
          <Form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ✅ Left Column: Vendor Info */}
            <div className="space-y-4">
              <Input label="Full Name" name="name" value={formData.name} onValueChange={(val) => handleChange("name", val)} required />
              <Input label="Email" type="email" name="email" value={formData.email} onValueChange={(val) => handleChange("email", val)} required />
              <Input label="Phone Number" type="tel" name="phone_number" value={formData.phone_number} onValueChange={(val) => handleChange("phone_number", val)} required />
              <Input label="Password" type="password" name="password" value={formData.password} onValueChange={(val) => handleChange("password", val)} required />
              <Input label="Confirm Password" type="password" name="password_confirmation" value={formData.password_confirmation} onValueChange={(val) => handleChange("password_confirmation", val)} required />
            </div>

            {/* ✅ Right Column: Restaurant Info */}
            <div className="space-y-4">
              <Input label="Restaurant Name" name="restaurant_name" value={formData.restaurant_name} onValueChange={(val) => handleChange("restaurant_name", val)} required />
              <Input label="Restaurant Phone" name="restaurant_phone" type="tel" value={formData.restaurant_phone} onValueChange={(val) => handleChange("restaurant_phone", val)} required />

              {/* 📍 Google Maps */}
              <div ref={mapRef} className="w-full h-[250px] bg-gray-200 rounded-lg shadow"></div>

              <Input label="Search Address" placeholder="Type your address" ref={autocompleteRef} />
              <Textarea label="Restaurant Address" value={formData.restaurant_address} readOnly />

              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
