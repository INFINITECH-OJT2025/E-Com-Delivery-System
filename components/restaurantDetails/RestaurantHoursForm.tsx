"use client";

import { useEffect, useState } from "react";
import { Input, Switch, Button } from "@heroui/react";

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

interface DaySchedule {
  day: string;
  enabled: boolean;
  opening: string;
  closing: string;
}

interface Props {
  isEditing: boolean;
  restaurant: any;
  onChange: (key: string, value: any) => void;
  setRestaurant: (fn: (prev: any) => any) => void;
}

export default function RestaurantHoursForm({
  isEditing,
  restaurant,
  onChange,
}: Props) {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);

  useEffect(() => {
    if (!restaurant || !restaurant.custom_schedule_json) {
      setSchedule(
        daysOfWeek.map((day) => ({
          day,
          enabled: true,
          opening: "06:00",
          closing: "23:00",
        }))
      );
    } else {
      const fromBackend = restaurant.custom_schedule_json;

      const converted: DaySchedule[] = daysOfWeek.map((day) => {
        const dayData = fromBackend[day] || {};
        return {
          day,
          enabled: dayData.enabled ?? false,
          opening: dayData.open ?? "06:00",
          closing: dayData.close ?? "23:00",
        };
      });

      setSchedule(converted);
    }
  }, [restaurant]);

  const updateSchedule = (updated: DaySchedule[]) => {
    setSchedule(updated);
    const asJson = updated.reduce((acc, item) => {
      acc[item.day] = {
        enabled: item.enabled,
        open: item.opening,
        close: item.closing,
      };
      return acc;
    }, {} as Record<string, any>);

    onChange("custom_schedule_json", asJson);
  };

  const handleToggleDay = (index: number) => {
    const updated = [...schedule];
    updated[index].enabled = !updated[index].enabled;
    updateSchedule(updated);
  };

  const handleTimeChange = (
    index: number,
    type: "opening" | "closing",
    value: string
  ) => {
    const updated = [...schedule];
    updated[index][type] = value;
    updateSchedule(updated);
  };

  const handleTodayTimeChange = (type: "opening" | "closing", value: string) => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const index = schedule.findIndex((s) => s.day === today);
    if (index !== -1) {
      handleTimeChange(index, type, value);
    }
  };

  const handleToggleStatus = (isOpen: boolean) => {
    onChange("status", isOpen ? "open" : "closed");
  };

  const copyTodayToAll = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todaySchedule = schedule.find((d) => d.day === today);
    if (!todaySchedule) return;

    const updated = schedule.map((d) => ({
      ...d,
      opening: todaySchedule.opening,
      closing: todaySchedule.closing,
    }));
    updateSchedule(updated);
  };

  return (
    <div className="space-y-10 p-6">
      {/* === Section: Title === */}
      <div>
      <h2 className="text-2xl font-bold">Business Hours</h2>
        <p className="text-gray-500 text-sm">
          Configure your restaurant's operational hours and status
        </p>
      </div>

      <hr className="border-gray-300" />

      {/* === Section: Open Toggle === */}
      <div className="space-y-2">
        <h3 className="text-md font-semibold">Restaurant Status</h3>
        <Switch
          isSelected={restaurant?.status === "open"}
          onValueChange={(v) => isEditing && handleToggleStatus(v)}
          isDisabled={!isEditing}
        >
            {restaurant?.status === "open" ? "Currently Open" : "Currently Closed"}
        </Switch>
      </div>

      <hr className="border-gray-300" />

      {/* === Section: Today Shortcut === */}
      <div className="space-y-2">
        <h3 className="text-md font-semibold">Today's Shortcut</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            type="time"
            label="Today's Opening Time"
            value={
              schedule.find((d) => d.day === new Date().toLocaleDateString("en-US", { weekday: "long" }))
                ?.opening || ""
            }
            isDisabled={!isEditing}
            onChange={(e) => handleTodayTimeChange("opening", e.target.value)}
          />
          <Input
            type="time"
            label="Today's Closing Time"
            value={
              schedule.find((d) => d.day === new Date().toLocaleDateString("en-US", { weekday: "long" }))
                ?.closing || ""
            }
            isDisabled={!isEditing}
            onChange={(e) => handleTodayTimeChange("closing", e.target.value)}
          />
        </div>
      </div>

      <hr className="border-gray-300" />

      {/* === Section: Weekly Schedule === */}
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-semibold">Weekly Schedule</h3>
          <p className="text-sm text-gray-500">
            Configure opening and closing times per day.
          </p>
        </div>

        <div className="grid gap-6">
          {schedule.map((day, index) => (
            <div
              key={day.day}
              className="grid grid-cols-1 md:grid-cols-4 items-center gap-4"
            >
              <div className="flex items-center gap-2 col-span-1">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  disabled={!isEditing}
                  onChange={() => handleToggleDay(index)}
                />
                <span className="font-medium">{day.day}</span>
              </div>

              <Input
                type="time"
                label="Opening"
                size="sm"
                value={day.opening}
                isDisabled={!isEditing || !day.enabled}
                onChange={(e) =>
                  handleTimeChange(index, "opening", e.target.value)
                }
              />

              <span className="text-center font-medium hidden md:block">to</span>

              <Input
                type="time"
                label="Closing"
                size="sm"
                value={day.closing}
                isDisabled={!isEditing || !day.enabled}
                onChange={(e) =>
                  handleTimeChange(index, "closing", e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <Button
            size="sm"
            color="primary"
            onPress={copyTodayToAll}
            isDisabled={!isEditing}
          >
            Copy Today's Hours to All Days
          </Button>
        </div>
      </div>
    </div>
  );
}
