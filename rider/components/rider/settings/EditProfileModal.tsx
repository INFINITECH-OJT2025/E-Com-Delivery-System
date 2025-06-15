"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
  addToast,
} from "@heroui/react";
import { riderProfileService } from "@/services/riderProfileService";
import { HiX } from "react-icons/hi";

export default function EditProfileModal({
  isOpen,
  onClose,
  rider,
  onProfileUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  rider?: {
    name: string;
    email: string;
    phone_number: string;
    profile_image?: string;
    vehicle_type?: string;
  };
  onProfileUpdate?: (updatedData: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    profile_image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rider) {
      setFormData({
        name: rider.name,
        email: rider.email,
        phone_number: rider.phone_number,
        profile_image: rider.profile_image || "",
      });
      setPreview(rider.profile_image || "");
    }
  }, [rider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await riderProfileService.updateProfile({
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        profile_image: imageFile,
      });
      
      
      if (res.status === "success") {
        addToast({
          title: "✅ Profile Updated",
          description: "Your profile has been saved successfully.",
          color: "success",
        });

        if (onProfileUpdate) {
          onProfileUpdate({
            ...rider,
            name: formData.name,
            email: formData.email,
            phone_number: formData.phone_number,
            profile_image: preview,
          });
        }

        onClose();
      } else {
        addToast({
          title: "⚠️ Error",
          description: res.message || "Something went wrong. Try again.",
          color: "danger",
        });
      }
    } catch (err) {
      addToast({
        title: "❌ Update Failed",
        description: "Could not update profile. Please try again.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
    isOpen={isOpen}
    size="full"
    onOpenChange={onClose}
    isDismissable={!loading}
    classNames={{
      base: "h-[100dvh] flex flex-col", // Full height + flex layout
      wrapper: "h-full",
      body: "flex-grow overflow-y-auto p-4 space-y-4", // Scrollable body
    }}
  >
    <ModalContent className="flex flex-col h-full">
      <ModalHeader className="p-4 bg-primary text-white relative">
        <h3 className="text-base font-semibold">👤 Edit Profile</h3>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white hover:opacity-80"
        >
          <HiX size={18} />
        </button>
      </ModalHeader>
  
      <ModalBody className="flex-grow overflow-y-auto p-4 space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            isRequired
          />

          <Input
            label="Email"
            name="email"
            value={formData.email}
            isDisabled
            classNames={{
              input: "bg-gray-100 text-gray-500 cursor-not-allowed",
            }}
          />

          <Input
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            isRequired
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Image
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm text-gray-600"
            />
            <p className="text-xs text-gray-500">Leave blank if you don't want to change your image.</p>

            {preview && (
              <img
                src={preview}
                alt="Profile Preview"
                className="w-20 h-20 rounded-full object-cover mx-auto border shadow"
              />
            )}
          </div>
     
      </ModalBody>
  
      <ModalFooter className="p-4 sticky bottom-0 bg-white border-t">
        <Button variant="ghost" onPress={onClose} isDisabled={loading}>
          Cancel
        </Button>
        <Button color="primary" onPress={handleSave} isDisabled={loading}>
          {loading ? "Saving ..." : "Save Changes"}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
  
  );
}
