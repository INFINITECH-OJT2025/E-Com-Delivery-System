"use client";

import { Card, CardHeader, Button } from "@heroui/react";
import { FiEdit2 } from "react-icons/fi";

export default function RiderProfileCard({
  rider,
  onEdit,
}: {
  rider: any;
  onEdit: () => void;
}) {
  return (
    <Card className="shadow-lg rounded-2xl overflow-hidden">
      {/* Header Bar */}
      <CardHeader className="bg-primary text-white flex justify-between items-center px-4 py-3">
        <h3 className="text-base font-semibold">👤 Rider Profile</h3>
        <Button
          onPress={onEdit}
          size="sm"
          variant="light"
          className="text-white bg-white/10 hover:bg-white/20 rounded-full"
          aria-label="Edit Profile"
        >
          <FiEdit2 className="text-lg" />
        </Button>
      </CardHeader>

      {/* Profile Content */}
      <div className="flex items-center gap-4 px-4 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <img
          src={rider?.profile_image || "/images/default-avatar.png"}
          alt="Profile"
          className="w-16 h-16 rounded-full border-2 border-white shadow-md"
        />
        <div>
          <h2 className="text-xl font-semibold leading-tight">{rider?.name}</h2>
          <p className="text-sm uppercase opacity-90">
            {rider?.vehicle_type || "No vehicle info"}
          </p>
          <p className="text-sm opacity-90">{rider?.email}</p>
        </div>
      </div>
    </Card>
  );
}
