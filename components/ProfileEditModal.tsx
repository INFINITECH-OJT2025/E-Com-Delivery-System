"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Spinner } from "@heroui/react";
import { useUser } from "@/context/userContext";

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
    const { user, updateProfile } = useUser();
    const [name, setName] = useState(user?.name || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        setError("");
        setLoading(true);

        const response = await updateProfile({ name });
        if (response.success) {
            onClose();
        } else {
            setError(response.message || "Failed to update profile.");
        }

        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <ModalContent>
                <ModalHeader className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-md font-bold text-gray-900">Edit Profile</h2>
                </ModalHeader>

                <ModalBody className="p-4 flex flex-col gap-4">
                    {/* 🔹 Name Input */}
                    <Input 
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                    />

                    {/* 🔹 Email Display (Disabled) */}
                    <Input label="Email" value={user?.email || ""} isDisabled />

                    {/* 🔴 Error Message */}
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                </ModalBody>

                <ModalFooter className="p-4 flex justify-between border-t">
                    <Button variant="ghost" onPress={onClose}>Cancel</Button>
                    <Button className="bg-primary text-white px-6 py-2" onPress={handleSave} disabled={loading}>
                        {loading ? <Spinner size="sm" color="white" /> : "Save Changes"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
