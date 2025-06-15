"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button } from "@heroui/react";
import { Mail, Send, X } from "lucide-react";
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
        <Modal
  isOpen={isOpen}
  onOpenChange={onClose}
  placement="bottom"
  size="full"
  scrollBehavior="outside"
  classNames={{
    base: "h-[100dvh] m-0",
    wrapper: "h-[100dvh] m-0 p-0",
    body: "p-0",
  }}
  hideCloseButton={true}
>
  <ModalContent className="m-0 rounded-t-xl h-full flex flex-col">
    {/* ✅ Header with optional close button */}
    <ModalHeader className="text-center text-primary font-bold text-xl flex items-center justify-center gap-2 relative">
      <Mail className="text-primary w-8 h-8" />
      Forgot Password
      <button
        onClick={onClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-default-500 hover:text-danger"
      >
        <X className="w-5 h-5" />
      </button>
    </ModalHeader>

    {/* ✅ Scrollable Body */}
    <ModalBody className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
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

      {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
      {message && <p className="text-green-600 text-sm text-center mt-3">{message}</p>}
    </ModalBody>

    {/* ✅ Sticky Footer */}
    <ModalFooter className="sticky bottom-0 bg-white border-t p-4 flex flex-col gap-2 z-10">
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
