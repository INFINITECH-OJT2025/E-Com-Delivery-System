"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button } from "@heroui/react";
import { Mail, Send } from "lucide-react";
import { authService } from "@/services/authService";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleResetRequest = async () => {
        if (!email.trim()) {
            setErrorMessage("Please enter your email.");
            return;
        }

        setLoading(true);
        setMessage(null);
        setErrorMessage(null);

        try {
            const response = await authService.forgotPassword(email);

            if (response.success) {
                setMessage("A password reset link has been sent to your email.");
            } else {
                setErrorMessage(response.message || "Failed to send reset email. Try again.");
            }
        } catch {
            setErrorMessage("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="bottom" size="full">
            <ModalContent>
                {/* ✅ Header */}
                <ModalHeader className="text-center text-primary font-bold text-xl flex items-center justify-center gap-2">
                    <Mail className="text-primary w-8 h-8" />
                    Forgot Password
                </ModalHeader>

                {/* ✅ Body */}
                <ModalBody className="p-6 flex flex-col items-center">
                    <p className="text-gray-500 text-center">
                        Enter your email to receive a password reset link.
                    </p>

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        isRequired
                        className="mt-4 w-full max-w-md"
                    />

                    {/* ✅ Error Message */}
                    {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

                    {/* ✅ Success Message */}
                    {message && <p className="text-green-600 text-sm text-center mt-3">{message}</p>}
                </ModalBody>

                {/* ✅ Footer */}
                <ModalFooter className="p-4 border-t flex flex-col gap-2">
                    <Button
                        className="w-full bg-primary text-white flex items-center justify-center gap-2"
                        onPress={handleResetRequest}
                        isLoading={loading}
                    >
                        <Send className="w-5 h-5" />
                        Send Reset Link
                    </Button>
                    <Button variant="light" className="w-full" onPress={onClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
