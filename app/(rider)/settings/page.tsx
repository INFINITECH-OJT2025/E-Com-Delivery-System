"use client";

import { useState } from "react";
import { FiLogOut, FiUser, FiTruck, FiKey, FiHelpCircle, FiFileText, FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import { Button } from "@heroui/react";
import UploadDocumentsModal from "@/components/rider/settings/UploadDocumentsModal";
import EditVehicleModal from "@/components/rider/settings/EditVehicleModal";
import ChangePasswordModal from "@/components/rider/settings/ChangePasswordModal";
import HelpCenterModal from "@/components/rider/settings/HelpCenterModal";
import EditProfileModal from "@/components/rider/settings/EditProfileModal";

export default function RiderSettingsPage() {
  const [modal, setModal] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center mb-6">
        <Image src="/images/delivery-panda.png" alt="Rider Avatar" width={80} height={80} className="rounded-full mb-3" />
        <h2 className="font-bold text-lg">Juan Rider</h2>
        <p className="text-gray-500 text-sm">juanrider@email.com</p>

        <div className="flex justify-around w-full mt-4 border-t pt-4 text-sm text-gray-600">
          <div className="flex flex-col items-center gap-1"><FiTruck size={18} /><span>Orders</span></div>
          <div className="flex flex-col items-center gap-1"><FiFileText size={18} /><span>Earnings</span></div>
          <div className="flex flex-col items-center gap-1"><FiUser size={18} /><span>Vehicle</span></div>
        </div>

        <Button className="mt-4 w-full" variant="bordered" onPress={() => setModal("profile")}>
  Manage Profile
</Button>
      </div>

      {/* Helpful for You */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">Helpful for You</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li onClick={() => setModal("upload")} className="flex items-center justify-between cursor-pointer hover:text-primary">
            <span className="flex items-center gap-2"><FiFileText /> Upload Documents</span>
            <FiArrowRight />
          </li>
          <li onClick={() => setModal("vehicle")} className="flex items-center justify-between cursor-pointer hover:text-primary">
            <span className="flex items-center gap-2"><FiUser /> Edit Vehicle Info</span>
            <FiArrowRight />
          </li>
        </ul>
      </div>

      {/* General */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">General</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li onClick={() => setModal("password")} className="flex items-center justify-between cursor-pointer hover:text-primary">
            <span className="flex items-center gap-2"><FiKey /> Change Password</span>
            <FiArrowRight />
          </li>
          <li onClick={() => setModal("help")} className="flex items-center justify-between cursor-pointer hover:text-primary">
            <span className="flex items-center gap-2"><FiHelpCircle /> Help Center</span>
            <FiArrowRight />
          </li>
        </ul>
      </div>

      <Button color="danger" className="w-full" startContent={<FiLogOut />}>Log out</Button>

      {/* Modals */}
      <UploadDocumentsModal isOpen={modal === "upload"} onClose={() => setModal(null)} />
      <EditVehicleModal isOpen={modal === "vehicle"} onClose={() => setModal(null)} />
      <ChangePasswordModal isOpen={modal === "password"} onClose={() => setModal(null)} />
      <HelpCenterModal isOpen={modal === "help"} onClose={() => setModal(null)} />
      <EditProfileModal isOpen={modal === "profile"} onClose={() => setModal(null)} rider={{
  name: "Juan Rider",
  email: "juanrider@email.com",
  phone_number: "09123456789",
}} />

    </div>
  );
}
