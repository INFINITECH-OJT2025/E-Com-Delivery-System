"use client";

import { Input, RadioGroup, Radio, Switch, Button } from "@heroui/react";
import { useVendorRegister } from "./VendorRegisterContext";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import TermsModal from "@/components/TermsModal";

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

interface Props {
  fieldErrors: Record<string, string>; // accepts validation errors
}

export default function StepSettings({ fieldErrors }: Props) {
  const { formData, updateFormData } = useVendorRegister();
  const [showCustomSchedule, setShowCustomSchedule] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [schedule, setSchedule] = useState(() =>
    daysOfWeek.map((day) => ({
      day,
      enabled: true,
      opening: "06:00",
      closing: "23:00",
    }))
  );

  const handleScheduleChange = (index: number, type: "opening" | "closing", value: string) => {
    const updated = [...schedule];
    updated[index][type] = value;
    setSchedule(updated);

    const asJson = updated.reduce((acc, item) => {
      acc[item.day] = {
        enabled: item.enabled,
        open: item.opening,
        close: item.closing,
      };
      return acc;
    }, {} as Record<string, any>);

    updateFormData("custom_schedule_json", asJson);
  };

  const handleDayToggle = (index: number) => {
    const updated = [...schedule];
    updated[index].enabled = !updated[index].enabled;
    setSchedule(updated);

    const asJson = updated.reduce((acc, item) => {
      acc[item.day] = {
        enabled: item.enabled,
        open: item.opening,
        close: item.closing,
      };
      return acc;
    }, {} as Record<string, any>);

    updateFormData("custom_schedule_json", asJson);
  };

  return (
    <div className="space-y-10">

      {/* Section: Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Operational Settings</h2>
        <p className="text-sm text-gray-500">
          Configure your restaurant's service options and business hours.
        </p>
      </div>

      <hr className="border-gray-300" />

      {/* Section: Service Options */}
      <div className="space-y-3">
        <h3 className="text-md font-semibold">Service Options</h3>
        <RadioGroup
          value={formData.service_type || "both"}
          onValueChange={(val) => updateFormData("service_type", val)}
          className="space-y-3"
        >
          <Radio value="delivery">🚚 Delivery Only</Radio>
          <Radio value="pickup">🏃 Pickup Only</Radio>
          <Radio value="both">📦 Both Delivery and Pickup</Radio>
        </RadioGroup>
      </div>

      <hr className="border-gray-300" />

      {/* Section: Business Hours */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold">Business Hours</h3>

        <Switch
          isSelected={formData.open_24_hours}
          onValueChange={(val) => updateFormData("open_24_hours", val)}
        >
          Open 24 Hours
        </Switch>

        {!formData.open_24_hours && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="time"
              label="Opening Time"
              labelPlacement="outside"
              value={formData.opening_time || ""}
              onChange={(e) => updateFormData("opening_time", e.target.value)}
            />
            <Input
              type="time"
              label="Closing Time"
              labelPlacement="outside"
              value={formData.closing_time || ""}
              onChange={(e) => updateFormData("closing_time", e.target.value)}
            />
          </div>
        )}

        {/* Expand Custom Schedule */}
        <div className="pt-4">
          <Button
            variant="ghost"
            endContent={<ArrowRight size={18} />}
            onClick={() => setShowCustomSchedule(!showCustomSchedule)}
          >
            {showCustomSchedule ? "Hide Custom Schedule" : "Set Custom Schedule"}
          </Button>
        </div>

        {/* Weekly Custom Schedule */}
        {showCustomSchedule && (
          <div className="mt-6 space-y-6">
            {schedule.map((day, index) => (
              <div
                key={day.day}
                className="grid grid-cols-1 md:grid-cols-4 items-center gap-4"
              >
                <div className="flex items-center gap-2 col-span-1">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={() => handleDayToggle(index)}
                  />
                  <span className="font-medium">{day.day}</span>
                </div>

                <Input
                  type="time"
                  label="Opening"
                  size="sm"
                  value={day.opening}
                  isDisabled={!day.enabled}
                  onChange={(e) => handleScheduleChange(index, "opening", e.target.value)}
                />

                <span className="text-center font-medium hidden md:block">to</span>

                <Input
                  type="time"
                  label="Closing"
                  size="sm"
                  value={day.closing}
                  isDisabled={!day.enabled}
                  onChange={(e) => handleScheduleChange(index, "closing", e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-gray-300" />

      {/* Section: Delivery Settings */}
      <div className="space-y-3">
        <h3 className="text-md font-semibold">Delivery Settings</h3>
        <Input
          type="number"
          label="Minimum Order Amount for Delivery ($)"
          labelPlacement="outside"
          placeholder="100.00"
          value={formData.minimum_order_amount || ""}
          onChange={(e) => updateFormData("minimum_order_amount", e.target.value)}
        />
      </div>

      <hr className="border-gray-300" />

      {/* Section: Restaurant Visibility */}
      <div className="space-y-3">
        <h3 className="text-md font-semibold">Restaurant Visibility</h3>
        <Switch
          isSelected={formData.visibility}
          onValueChange={(val) => updateFormData("visibility", val)}
        >
          Show restaurant in search results and browsing
        </Switch>
      </div>

      <hr className="border-gray-300" />

      {/* Section: Terms of Service */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <Switch
            isSelected={formData.agreed_to_terms}
            onValueChange={(val) => updateFormData("agreed_to_terms", val)}
          />
          <span className="text-sm text-gray-600">
            I agree to the{" "}
            <button
              type="button"
              className="text-primary hover:underline focus:outline-none"
              onClick={() => setShowTermsModal(true)}
            >
              Terms of Service and Privacy Policy
            </button>
          </span>
        </div>

        {/* Error message if not agreed */}
        {fieldErrors.agreed_to_terms && (
          <p className="text-red-500 text-sm">{fieldErrors.agreed_to_terms}</p>
        )}
      </div>

      {/* Modal: Terms of Service */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  );
}
