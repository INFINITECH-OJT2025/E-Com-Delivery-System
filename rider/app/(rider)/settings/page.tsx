"use client";

import { useEffect, useState } from "react";
import {
  FiLogOut,
  FiUser,
  FiTruck,
  FiKey,
  FiHelpCircle,
  FiFileText,
  FiArrowRight,
} from "react-icons/fi";
import Image from "next/image";
import { Button, Spinner, addToast } from "@heroui/react";

// Modals
import UploadDocumentsModal from "@/components/rider/settings/UploadDocumentsModal";
import EditVehicleModal from "@/components/rider/settings/EditVehicleModal";
import ChangePasswordModal from "@/components/rider/settings/ChangePasswordModal";
import HelpCenterModal from "@/components/rider/settings/HelpCenterModal";
import EditProfileModal from "@/components/rider/settings/EditProfileModal";

// Service
import { RiderDashboardService } from "@/services/riderDashboardService";

export default function RiderSettingsPage() {
  const [modal, setModal] = useState<string | null>(null);
  const [rider, setRider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const profileData = await RiderDashboardService.getProfile();
      if (profileData.success) {
        setRider(profileData.data);
      } else {
        addToast({
          title: "Error",
          description: "Failed to fetch rider profile.",
          color: "danger",
        });
      }
    } catch {
      addToast({
        title: "Error",
        description: "Something went wrong.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading || !rider) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      {/* 🧑‍💼 Profile Card */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center mb-6">
        <Image
          src={rider.profile_image || "/images/default-avatar.png"}
          alt="Rider Avatar"
          width={80}
          height={80}
          className="rounded-full mb-3 border shadow object-cover"
        />
        <h2 className="font-bold text-lg">{rider.name}</h2>
        <p className="text-gray-500 text-sm">{rider.email}</p>



        <Button
          className="mt-4 w-full"
          variant="bordered"
          onPress={() => setModal("profile")}
        >
          Manage Profile
        </Button>
      </div>

      {/* 🛠️ Helpful for You */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">
          Helpful for You
        </h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li
            onClick={() => setModal("upload")}
            className="flex items-center justify-between cursor-pointer hover:text-primary"
          >
            <span className="flex items-center gap-2">
              <FiFileText /> Upload Documents
            </span>
            <FiArrowRight />
          </li>
          <li
            onClick={() => setModal("vehicle")}
            className="flex items-center justify-between cursor-pointer hover:text-primary"
          >
            <span className="flex items-center gap-2">
              <FiUser /> Edit Vehicle Info
            </span>
            <FiArrowRight />
          </li>
        </ul>
      </div>

      {/* ⚙️ General */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">General</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li
            onClick={() => setModal("password")}
            className="flex items-center justify-between cursor-pointer hover:text-primary"
          >
            <span className="flex items-center gap-2">
              <FiKey /> Change Password
            </span>
            <FiArrowRight />
          </li>
          <li
            onClick={() => setModal("help")}
            className="flex items-center justify-between cursor-pointer hover:text-primary"
          >
            <span className="flex items-center gap-2">
              <FiHelpCircle /> Help Center
            </span>
            <FiArrowRight />
          </li>
        </ul>
      </div>

      {/* 🚪 Logout */}
      <Button color="danger" className="w-full" startContent={<FiLogOut />}>
        Log out
      </Button>

      {/* 🔒 Modals */}
      <UploadDocumentsModal
  isOpen={modal === "upload"}
  onClose={() => setModal(null)}
  licenseImage={rider.license_image}
  onUploadSuccess={fetchProfile} // ✅ Pass refetch function

/>
      <EditVehicleModal
  isOpen={modal === "vehicle"}
  onClose={() => setModal(null)}
  rider={rider}
  onUpdate={(data) => setRider((prev) => ({ ...prev, ...data }))}
/>
      <ChangePasswordModal isOpen={modal === "password"} onClose={() => setModal(null)} />
      <HelpCenterModal isOpen={modal === "help"} onClose={() => setModal(null)} />
      <EditProfileModal
        isOpen={modal === "profile"}
        onClose={() => setModal(null)}
        rider={rider}
        onProfileUpdate={(updated) => setRider((prev) => ({ ...prev, ...updated }))}
      />
    </div>
  );
}
