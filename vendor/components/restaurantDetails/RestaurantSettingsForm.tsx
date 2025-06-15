"use client";

import { Input, RadioGroup, Radio, Switch } from "@heroui/react";

interface Props {
  isEditing: boolean;
  restaurant: any;
  onChange: (key: string, value: any) => void;
}

export default function RestaurantSettingsForm({
  isEditing,
  restaurant,
  onChange,
}: Props) {
  return (
    <div className="space-y-8 p-6">
      {/* Section Title */}
      <div>
        <h2 className="text-2xl font-bold">Restaurant Settings</h2>
        <p className="text-gray-500 text-sm">
          Configure your restaurant's operational settings
        </p>
      </div>

      <hr className="border-gray-300" />

      {/* === Service Type === */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold">Service Options</h3>
        <RadioGroup
          value={restaurant.service_type || "both"}
          onValueChange={(val) => onChange("service_type", val)}
          className="space-y-3"
          isDisabled={!isEditing}
        >
          <Radio value="delivery">🚚 Delivery Only</Radio>
          <Radio value="pickup">🏃 Pickup Only</Radio>
          <Radio value="both">📦 Both Delivery and Pickup</Radio>
        </RadioGroup>
      </div>

      <hr className="border-gray-300" />

      {/* === Delivery Minimum === */}
      <div className="space-y-2">
        <h3 className="text-md font-semibold">Delivery Settings</h3>
        <Input
          type="number"
          label="Minimum Order Amount for Delivery (₱)"
          placeholder="Enter amount"
          value={restaurant.minimum_order_for_delivery || ""}
          onChange={(e) =>
            onChange("minimum_order_for_delivery", parseFloat(e.target.value))
          }
          isDisabled={!isEditing}
        />
        <p className="text-sm text-gray-500">
          Customers must order at least this amount to qualify for delivery
        </p>
      </div>

      <hr className="border-gray-300" />

      {/* === Visibility === */}
      <div className="space-y-2">
        <h3 className="text-md font-semibold">Restaurant Visibility</h3>
        <Switch
          isSelected={restaurant.visibility === true}
          onValueChange={(val) => onChange("visibility", val)}
          isDisabled={!isEditing}
        >
          Show restaurant in search results and browsing
        </Switch>
        <p className="text-sm text-gray-500 ml-1">
          When turned off, your restaurant will not appear in search results or
          category browsing, but customers with a direct link can still place orders.
        </p>
      </div>
    </div>
  );
}
