"use client";

import { useEffect, useRef, useState } from "react";
import { useVendorAuth } from "@/context/AuthContext";
import { googleMapsService } from "@/services/googleMapsService";
import { categoryService } from "@/services/categoryService"; // ✅ Import Category Service
import { Button, Card, CardBody, Form, Input, Select, SelectItem ,Textarea, useDisclosure } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/passwordIcons";
import TermsModal from "@/components/TermsModal";

import React from "react";
export default function VendorRegister() {
  const { register } = useVendorAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  interface Category {
    id: string;
    name: string;
  }
  
  const [categories, setCategories] = useState<Category[]>([]);
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
    restaurant_category_id: "",
  });

  const autocompleteRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  

  const toggleVisibility = () => setIsVisible(!isVisible);
  useEffect(() => {
    loadGoogleMaps();
    getCurrentLocation();
    fetchCategories();
  }, []);

  // ✅ Fetch restaurant categories
  const fetchCategories = async () => {
    const response = await categoryService.fetchRestaurantCategories();
    if (response.success) {
      setCategories(response.data.categories);
    } else {
      addToast({ title: "Error", description: "Failed to load categories", color: "danger" });
    }
  };

  // ✅ Get Current Location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const address = await googleMapsService.getAddressFromCoords(lat, lng);
      setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng, restaurant_address: address || "Unknown Location" }));
      if (mapInstance.current && markerRef.current) {
        markerRef.current.setPosition({ lat, lng });
        mapInstance.current.setCenter({ lat, lng });
      }
    });
  };

  // ✅ Load Google Maps API
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

  // ✅ Initialize Google Maps & Autocomplete
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

  // ✅ Handle Input Changes
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
   
    
    // ✅ Ensure all required fields are filled
    if (!formData.restaurant_category_id) {
      addToast({ title: "Category Required", description: "Please select a restaurant category.", color: "warning" });
      setLoading(false);
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      addToast({ title: "Location Required", description: "Please set your restaurant's location on the map.", color: "warning" });
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      addToast({ title: "Registration Successful", description: "Please verify your email.", color: "success" });
      router.push("/login");
    } catch {
      addToast({ title: "Registration Failed", description: "Please check your details.", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex flex-col lg:flex-row items-start bg-cover bg-center min-h-screen px-4 py-10 overflow-y-auto"
      style={{ backgroundImage: 'url("/images/chat-bg-1.png")' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-60"></div>
  
      {/* Left Promo Text (only on large screens) */}
      <div className="hidden lg:flex flex-col justify-center max-w-lg px-8 z-10 ml-9 mt-2 text-white items-center">
        <h1 className="text-4xl font-bold mb-4 text-center ">
          Boost your revenue with E-com delivery service!
        </h1>
        <p className="text-xl text-center">
          Sign up now and start earning more with the leading food delivery service E-com delivery service.
        </p>
        <img
    src="/images/delivery-panda.png"
    alt="Delivery Panda"
    className="w-100 h-100 mb-4 rounded-full object-contain"
  />
      </div>
  
      {/* Registration Form Card */}
      <Card className="relative z-10 w-full lg:w-2/3 max-w-screen-xl shadow-lg p-6 bg-white dark:bg-gray-900 lg:ml-auto">
        <CardBody>
          <h2 className="text-2xl font-bold text-center mb-6">Vendor Registration</h2>
  
          <Form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Vendor Info */}
            <div className="space-y-4">
              <Input label="Full Name" name="name" value={formData.name} onValueChange={(val) => handleChange("name", val)} required />
              <Input label="Email" type="email" name="email" value={formData.email} onValueChange={(val) => handleChange("email", val)} required />
              <Input label="Phone Number" type="tel" name="phone_number" value={formData.phone_number} onValueChange={(val) => handleChange("phone_number", val)} required />
              <Input
                label="Password"
                type={isVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onValueChange={(val) => handleChange("password", val)}
                required
                endContent={
                  <button aria-label="toggle password visibility" className="focus:outline-none" type="button" onClick={toggleVisibility}>
                    {isVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
              <Input
                label="Confirm Password"
                type={isVisible ? "text" : "password"}
                name="password_confirmation"
                value={formData.password_confirmation}
                onValueChange={(val) => handleChange("password_confirmation", val)}
                required
                endContent={
                  <button aria-label="toggle password visibility" className="focus:outline-none" type="button" onClick={toggleVisibility}>
                    {isVisible ? (
                      <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
            </div>
  
            {/* Right Column: Restaurant Info */}
            <div className="space-y-4">
              <Input label="Restaurant Name" name="restaurant_name" value={formData.restaurant_name} onValueChange={(val) => handleChange("restaurant_name", val)} required />
              <Input label="Restaurant Phone" name="restaurant_phone" type="tel" value={formData.restaurant_phone} onValueChange={(val) => handleChange("restaurant_phone", val)} required />
  
              <Select
                label="Restaurant Category"
                name="restaurant_category_id"
                onChange={(val) => handleChange("restaurant_category_id", val)}
                value={formData.restaurant_category_id}
              >
                {categories.length > 0 ? (
                  categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem key="loading" value="" disabled>
                    Loading categories...
                  </SelectItem>
                )}
              </Select>
  
              <div ref={mapRef} className="w-full h-[250px] bg-gray-200 rounded-lg shadow"></div>
  
              <Input label="Search Address" placeholder="Type your address" ref={autocompleteRef} />
              <Textarea label="Restaurant Address" value={formData.restaurant_address} readOnly className="resize-none" />
              <p className="text-gray-500 text-center text-sm mt-2">
              By signing up you agree to our{" "}
              <label htmlFor="agree">
            I agree to the{" "}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-secondary hover:underline"
            >
              Terms and Conditions
            </button>
          </label>
            </p>

              <Button type="submit" className="w-full" color="primary" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />


    </div>
  );
}  