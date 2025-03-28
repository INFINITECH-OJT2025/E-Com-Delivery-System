"use client";
import { useState, useEffect } from "react";
import { RestaurantService } from "@/services/restaurantService";
import { useVendorAuth } from "@/context/AuthContext";
import { FaSave } from "react-icons/fa";
import Image from "next/image";
import { addToast } from "@heroui/toast";

interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  phone_number: string;
  status: "open" | "closed";
  slug: string;
  rating: number | null;
  service_type: "delivery" | "pickup" | "both";
  minimum_order_for_delivery: number;
  logo: string | null;
  banner_image: string | null;
  restaurant_category_id: number | null;
}

interface Category {
  id: number;
  name: string;
}

export default function RestaurantDetailsPage() {
  const { vendor } = useVendorAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantData = await RestaurantService.getRestaurantDetails();
        setRestaurant(restaurantData); // Set restaurant details when fetched
      } catch (error) {
        setError("Failed to fetch restaurant details.");
      }

      try {
        const categoriesData = await RestaurantService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        setError("Failed to fetch categories.");
      } finally {
        setLoading(false);
      }
    };

    if (vendor) fetchData();
  }, [vendor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setRestaurant((prev) =>
      prev ? { ...prev, [e.target.name]: e.target.value } : prev
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "banner_image") => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === "logo") {
        setLogoFile(file);
        setLogoPreview(previewUrl);
      } else {
        setBannerFile(file);
        setBannerPreview(previewUrl);
      }
    }
  };

  const handleSave = async () => {
    if (!restaurant) return;
    setIsSaving(true);

    try {
      const updatedData = await RestaurantService.updateRestaurantDetails(
        restaurant,
        logoFile,
        bannerFile
      );

      // Fetch the updated restaurant details again
      const refreshedRestaurant = await RestaurantService.getRestaurantDetails();
      setRestaurant(refreshedRestaurant); // Update with the latest restaurant data

      // Success Toast
      addToast({
        title: "Restaurant Details Updated",
        description: "Your restaurant details were successfully updated.",
        color: "success",
      });
    } catch (error) {
      setError("Failed to update restaurant details.");

      // Error Toast
      addToast({
        title: "Update Failed",
        description: "There was an issue updating the restaurant details.",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-6">Restaurant Details</h1>
        <div className="space-y-6">
          <div className="w-full h-12 rounded-md bg-gray-300 animate-pulse"></div>
          <div className="w-full h-12 rounded-md bg-gray-300 animate-pulse"></div>
          <div className="w-full h-12 rounded-md bg-gray-300 animate-pulse"></div>
          <div className="w-full h-12 rounded-md bg-gray-300 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
<div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md max-w-3xl mx-auto transition-all">
<h1 className="text-3xl font-semibold mb-6 text-center">Restaurant Details</h1>

      <div className="space-y-6">
        {/* Restaurant Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
Restaurant Name</label>
            <input
              type="text"
              name="name"
              value={restaurant.name}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
Slug (SEO-friendly URL)</label>
            <input
              type="text"
              name="slug"
              value={restaurant.slug}
              onChange={handleChange}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
Description</label>
          <textarea
            name="description"
            value={restaurant.description || ""}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
Address</label>
          <input
            type="text"
            name="address"
            value={restaurant.address}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={restaurant.phone_number}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
Status</label>
          <select
            name="status"
            value={restaurant.status}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
Service Type</label>
          <select
            name="service_type"
            value={restaurant.service_type}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="delivery">Delivery</option>
            <option value="pickup">Pickup</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
Minimum Order for Delivery</label>
          <input
            type="number"
            name="minimum_order_for_delivery"
            value={restaurant.minimum_order_for_delivery}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
Category</label>
          <select
            name="restaurant_category_id"
            value={restaurant.restaurant_category_id || ""}
            onChange={handleChange}
            className="w-full mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Image Previews */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "logo")}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {logoPreview && (
              <div className="mt-2 p-4 border border-gray-200 rounded-md bg-gray-50 text-center">
                <Image src={logoPreview} alt="Logo Preview" width={200} height={200} className="mx-auto" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "banner_image")}
              className="w-full mt-2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            {bannerPreview && (
              <div className="mt-2 p-4 border border-gray-200 rounded-md bg-gray-50 text-center">
                <Image src={bannerPreview} alt="Banner Preview" width={600} height={200} className="mx-auto" />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSave}
            className="inline-flex block items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            disabled={isSaving}
          >
            <FaSave className="mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
