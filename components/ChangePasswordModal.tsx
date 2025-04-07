"use client";

import { useState } from "react";
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
import { authService } from "@/services/authService";
import { EyeSlashFilledIcon, EyeFilledIcon } from "@/components/icons";

export default function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [isCurrentVisible, setIsCurrentVisible] = useState(false);
  const [isNewVisible, setIsNewVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const [currentError, setCurrentError] = useState("");
  const [newError, setNewError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [apiError, setApiError] = useState("");

  const toggleVisibility = (field: string) => {
    if (field === "current") setIsCurrentVisible(!isCurrentVisible);
    if (field === "new") setIsNewVisible(!isNewVisible);
    if (field === "confirm") setIsConfirmVisible(!isConfirmVisible);
  };

  const handleBlur = (field: string) => {
    if (field === "current") {
      setCurrentError(currentPassword ? "" : "Current password is required");
    }

    if (field === "new") {
      if (!newPassword) {
        setNewError("New password is required");
      } else if (newPassword.length < 6) {
        setNewError("Password must be at least 6 characters");
      } else {
        setNewError("");
      }
    }

    if (field === "confirm") {
      if (!confirmPassword) {
        setConfirmError("Please confirm your password");
      } else if (newPassword !== confirmPassword) {
        setConfirmError("Passwords do not match");
      } else {
        setConfirmError("");
      }
    }
  };

  const handleSave = async () => {
    setApiError(""); // clear old API errors

    handleBlur("current");
    handleBlur("new");
    handleBlur("confirm");

    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (currentError || newError || confirmError) return;

    setLoading(true);
    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      if (response.status === "success") {
        addToast({
          title: "✅ Password Updated",
          description: "Your password has been successfully updated.",
          color: "success",
        });
        onClose();
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setApiError(response.message || "Failed to update password.");
      }
    } catch (err) {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader className="p-4 text-center shadow-sm rounded-t-xl">
          <h3 className="text-lg font-bold">🔒 Change Password</h3>
        </ModalHeader>

        <ModalBody className="space-y-4 p-4">
          {apiError && (
            <div className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded-md">
              {apiError}
            </div>
          )}

          <Input
            label="Current Password"
            type={isCurrentVisible ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            onBlur={() => handleBlur("current")}
            errorMessage={currentError}
            isInvalid={!!currentError}
            endContent={
              <button onClick={() => toggleVisibility("current")} type="button">
                {isCurrentVisible ? (
                  <EyeSlashFilledIcon className="text-2xl text-default-400" />
                ) : (
                  <EyeFilledIcon className="text-2xl text-default-400" />
                )}
              </button>
            }
          />

          <Input
            label="New Password"
            type={isNewVisible ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={() => handleBlur("new")}
            errorMessage={newError}
            isInvalid={!!newError}
            endContent={
              <button onClick={() => toggleVisibility("new")} type="button">
                {isNewVisible ? (
                  <EyeSlashFilledIcon className="text-2xl text-default-400" />
                ) : (
                  <EyeFilledIcon className="text-2xl text-default-400" />
                )}
              </button>
            }
          />

          <Input
            label="Confirm New Password"
            type={isConfirmVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleBlur("confirm")}
            errorMessage={confirmError}
            isInvalid={!!confirmError}
            endContent={
              <button onClick={() => toggleVisibility("confirm")} type="button">
                {isConfirmVisible ? (
                  <EyeSlashFilledIcon className="text-2xl text-default-400" />
                ) : (
                  <EyeFilledIcon className="text-2xl text-default-400" />
                )}
              </button>
            }
          />
        </ModalBody>

        <ModalFooter className="p-4 flex justify-between">
          <Button variant="ghost" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSave} isDisabled={loading}>
            {loading ? <Spinner size="sm" color="white" /> : "Update"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
