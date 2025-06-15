"use client";

import { Input, Select, SelectItem, Textarea } from "@heroui/react";
import { useVendorRegister } from "./VendorRegisterContext";
import { UploadCloud, ImageIcon, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { categoryService } from "@/services/categoryService";
import { addToast } from "@heroui/toast";

interface Props {
  fieldErrors: Record<string, string>; // ✅ accepts validation errors
}

export default function StepRestaurant({ fieldErrors }: Props) {
  const { formData, updateFormData } = useVendorRegister();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    const response = await categoryService.fetchRestaurantCategories();
    if (response.success) {
      setCategories(response.data.categories);
    } else {
      addToast({
        title: "Error",
        description: "Failed to load categories",
        color: "danger",
      });
    }
    setLoadingCategories(false);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "logo") setLogoPreview(reader.result as string);
        if (type === "banner") setBannerPreview(reader.result as string);
        updateFormData(
          type === "logo" ? "restaurant_logo" : "restaurant_banner",
          file
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = (type: "logo" | "banner") => {
    if (type === "logo") {
      setLogoPreview(null);
      updateFormData("restaurant_logo", null);
    }
    if (type === "banner") {
      setBannerPreview(null);
      updateFormData("restaurant_banner", null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Restaurant Information</h2>
        <p className="text-sm text-gray-500">
          Tell us about your restaurant. This information will be displayed to
          customers.
        </p>
      </div>

      {/* Restaurant Name */}
      <Input
        label="Restaurant Name"
        labelPlacement="outside"
        placeholder="My Amazing Restaurant"
        value={formData.restaurant_name}
        onValueChange={(val) => updateFormData("restaurant_name", val)}
        isRequired
        isInvalid={!!fieldErrors.name} // ✅ this is missing in your code
        errorMessage={fieldErrors.restaurant_name}
      />

      {/* Restaurant Category */}
      <Select
        label="Restaurant Category"
        labelPlacement="outside"
        placeholder="Select a category"
        selectedKeys={
          formData.restaurant_category_id
            ? [formData.restaurant_category_id]
            : []
        }
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          updateFormData("restaurant_category_id", selected);
        }}
        isDisabled={loadingCategories}
        isInvalid={!!fieldErrors.name} // ✅ this is missing in your code
        errorMessage={fieldErrors.restaurant_category_id}
      >
        {loadingCategories ? (
          <SelectItem key="loading" value="" disabled>
            Loading categories...
          </SelectItem>
        ) : (
          categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))
        )}
      </Select>

      {/* Restaurant Description */}
      <Textarea
        label="Restaurant Description"
        labelPlacement="outside"
        placeholder="Tell customers about your restaurant, cuisine, specialties, etc."
        value={formData.restaurant_description}
        onValueChange={(val) => updateFormData("restaurant_description", val)}
      />

      {/* Logo and Banner Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center relative">
          {logoPreview ? (
            <>
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="w-24 h-24 object-cover rounded-full"
              />
              <button
                type="button"
                onClick={() => clearFile("logo")}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </>
          ) : (
            <label className="flex flex-col items-center text-gray-400 cursor-pointer">
              <UploadCloud className="w-10 h-10 mb-2" />
              <span>Upload Logo</span>
              <span className="text-xs text-gray-400">
                PNG, JPG, or SVG (max 2MB)
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(e) => handleFileChange(e, "logo")}
              />
            </label>
          )}
        </div>

        {/* Banner Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center relative">
          {bannerPreview ? (
            <>
              <img
                src={bannerPreview}
                alt="Banner Preview"
                className="w-full h-32 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => clearFile("banner")}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </>
          ) : (
            <label className="flex flex-col items-center text-gray-400 cursor-pointer">
              <ImageIcon className="w-10 h-10 mb-2" />
              <span>Upload Banner</span>
              <span className="text-xs text-gray-400">
                PNG or JPG (max 5MB)
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => handleFileChange(e, "banner")}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
