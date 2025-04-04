"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Spinner } from "@heroui/react";
import { addToast } from "@heroui/react";
import { riderProfileService } from "@/services/riderProfileService";
import { EyeSlashFilledIcon, EyeFilledIcon } from "@/components/icons";

export default function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Toggle visibility of password
  const toggleVisibility = (field: string) => {
    if (field === "current") setIsCurrentPasswordVisible(!isCurrentPasswordVisible);
    if (field === "new") setIsNewPasswordVisible(!isNewPasswordVisible);
    if (field === "confirm") setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const handleBlur = (field: string) => {
    if (field === "current") {
      setCurrentPasswordError(currentPassword ? "" : "Current password is required");
    }
    if (field === "new") {
      if (!newPassword) {
        setNewPasswordError("New password is required");
      } else if (newPassword.length < 6) {
        setNewPasswordError("Password must be at least 6 characters");
      } else {
        setNewPasswordError("");
      }
    }
    if (field === "confirm") {
      if (newPassword !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }
  };

  const handleSave = async () => {
    // Trigger validation for all fields
    handleBlur("current");
    handleBlur("new");
    handleBlur("confirm");

    // Check if there are any validation errors
    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      return; // Don't proceed if there are validation errors
    }

    // If no errors, proceed with saving
    setLoading(true);
    try {
      const response = await riderProfileService.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.status === "success") {
        addToast({
          title: "Password Updated",
          description: "Your password has been successfully updated.",
          color: "success",
        });
        onClose();
      } else {
        addToast({
          title: "Error",
          description: response.message || "Failed to update password.",
          color: "danger",
        });
      }
    } catch (err) {
      addToast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
};


  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader className="p-4 bg-primary text-white text-center shadow-sm rounded-t-xl relative">
          <h3 className="text-lg font-bold">🔒 Change Password</h3>
          <button onClick={onClose} className="absolute right-4 top-4 text-white text-sm hover:opacity-80">
            ✖
          </button>
        </ModalHeader>

        <ModalBody className="space-y-2 p-4">
          <Input
            label="Current Password"
            type={isCurrentPasswordVisible ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            errorMessage={currentPasswordError}
            isInvalid={!!currentPasswordError}
            endContent={
              <button
                aria-label="toggle password visibility"
                className="focus:outline-none"
                type="button"
                onClick={() => toggleVisibility("current")}
              >
                {isCurrentPasswordVisible ? (
                  <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
            onBlur={() => handleBlur("current")}
          />

          <Input
            label="New Password"
            type={isNewPasswordVisible ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            errorMessage={newPasswordError}
            isInvalid={!!newPasswordError}
            endContent={
              <button
                aria-label="toggle password visibility"
                className="focus:outline-none"
                type="button"
                onClick={() => toggleVisibility("new")}
              >
                {isNewPasswordVisible ? (
                  <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
            onBlur={() => handleBlur("new")}
          />

          <Input
            label="Confirm New Password"
            type={isConfirmPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            errorMessage={confirmPasswordError}
            isInvalid={!!confirmPasswordError}
            endContent={
              <button
                aria-label="toggle password visibility"
                className="focus:outline-none"
                type="button"
                onClick={() => toggleVisibility("confirm")}
              >
                {isConfirmPasswordVisible ? (
                  <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                ) : (
                  <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                )}
              </button>
            }
            onBlur={() => handleBlur("confirm")}
          />
        </ModalBody>

        <ModalFooter className="p-4">
          <Button variant="ghost" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSave} isDisabled={loading}>
            {loading ? "Saving ...": "Update"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
