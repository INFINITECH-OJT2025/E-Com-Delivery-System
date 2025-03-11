"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Spinner } from "@heroui/react";
import { userService } from "@/services/userService";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [formData, setFormData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /** ✅ Handle Input Change */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /** ✅ Save Password Change */
    const handleSave = async () => {
        setError("");
        setLoading(true);

        if (formData.new_password !== formData.confirm_password) {
            setError("New passwords do not match.");
            setLoading(false);
            return;
        }

        const response = await userService.changePassword(formData);
        if (response.success) {
            onClose();
        } else {
            setError(response.message || "Failed to change password.");
        }

        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <ModalContent>
                <ModalHeader className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-md font-bold text-gray-900">Change Password</h2>
                </ModalHeader>

                <ModalBody className="p-4 flex flex-col gap-4">
                    <Input 
                        type="password"
                        label="Current Password"
                        name="current_password"
                        value={formData.current_password}
                        onChange={handleChange}
                        placeholder="Enter current password"
                    />

                    <Input 
                        type="password"
                        label="New Password"
                        name="new_password"
                        value={formData.new_password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                    />

                    <Input 
                        type="password"
                        label="Confirm New Password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                    />

                    {/* 🔴 Error Message */}
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                </ModalBody>

                <ModalFooter className="p-4 flex justify-between border-t">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button className="bg-primary text-white px-6 py-2" onClick={handleSave} disabled={loading}>
                        {loading ? <Spinner size="sm" color="white" /> : "Save Changes"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
