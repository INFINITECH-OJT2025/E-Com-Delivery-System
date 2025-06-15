"use client";

import { Input, Textarea, Select, SelectItem } from "@heroui/react";
import { useState } from "react";

interface Props {
  isEditing: boolean;
  restaurant: any;
  categories: { id: number; name: string }[];
  onChange: (key: string, value: any) => void;
}

export default function RestaurantBasicInfo({
  isEditing,
  restaurant,
  categories,
  onChange,
}: Props) {
  const [customCategory, setCustomCategory] = useState("");

  const handleCategoryChange = (keys: Set<React.Key>) => {
    const selected = Array.from(keys)[0];

    if (selected === "other") {
      onChange("restaurant_category_id", null);
    } else {
      onChange("restaurant_category_id", parseInt(selected as string));
      setCustomCategory("");
    }
  };

  return (
    <div className="space-y-8 p-6"> {/* Section Title */}
    <div className="space-y-1 mb-6">
   <h2 className="text-2xl font-bold">Basic Information</h2>
      <p className="text-sm text-gray-500">
        Update your restaurant's basic details and description
      </p>
    </div>
      {/* Restaurant Name + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          isRequired
          name="name"
          label="Restaurant Name"
          labelPlacement="outside"
          placeholder="Enter restaurant name"
          description="This will be shown on your public profile."
          value={restaurant.name || ""}
          onChange={(e) => onChange("name", e.target.value)}
          isDisabled={!isEditing}
          errorMessage="Restaurant name is required"
        />
        <Input
          isRequired
          name="slug"
          label="URL Slug"
          labelPlacement="outside"
          placeholder="e.g., mcdonalds-times-square"
          description="This will appear in the URL (e.g., yourdomain.com/restaurants/your-slug)"
          value={restaurant.slug || ""}
          onChange={(e) => onChange("slug", e.target.value)}
          isDisabled={!isEditing}
          errorMessage="Slug is required"
        />
      </div>

      {/* Description */}
      <div className="mt-6">
        <Textarea
          name="description"
          label="Restaurant Description"
          labelPlacement="outside"
          placeholder="Brief description of your restaurant"
          description="Tell customers what makes your restaurant special."
          value={restaurant.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          isDisabled={!isEditing}
        />
      </div>

      {/* Phone */}
      <div className="mt-6">
        <Input
          name="phone_number"
          type="tel"
          label="Phone Number"
          labelPlacement="outside"
          placeholder="+63 912 345 6789"
          description="Contact number customers can reach out to."
          value={restaurant.phone_number || ""}
          onChange={(e) => onChange("phone_number", e.target.value)}
          isDisabled={!isEditing}
          errorMessage="A valid phone number is required"
        />
      </div>

      {/* Category Dropdown */}
      <div className="mt-6">
        <Select
          name="restaurant_category_id"
          label="Restaurant Category"
          labelPlacement="outside"
          placeholder="Select category"
          description="Choose the most relevant category. Select 'Other' if not listed."
          selectedKeys={
            restaurant.restaurant_category_id
              ? [restaurant.restaurant_category_id.toString()]
              : ["other"]
          }
          onSelectionChange={handleCategoryChange}
          isDisabled={!isEditing}
        >
          {categories.map((cat) => (
            <SelectItem key={cat.id.toString()}>{cat.name}</SelectItem>
          ))}
          <SelectItem key="other">Other (not listed)</SelectItem>
        </Select>
      </div>

      {/* Custom Category Input */}
      {isEditing && restaurant.restaurant_category_id === null && (
        <div className="mt-6">
          <Input
            label="Custom Category Name"
            labelPlacement="outside"
            placeholder="Type your category"
            description="Provide your custom restaurant category."
            value={customCategory}
            onChange={(e) => {
              setCustomCategory(e.target.value);
              onChange("custom_category_name", e.target.value);
            }}
          />
        </div>
      )}
    </div>
  );
}
