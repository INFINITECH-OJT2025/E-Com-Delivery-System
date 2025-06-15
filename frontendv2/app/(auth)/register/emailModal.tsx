"use client";

import React, { useState, useCallback } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Form, Input, Button } from "@heroui/react";
import { Mail, Send } from "lucide-react";
import { authService } from "@/services/authService";
import { X } from "lucide-react";

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenLogin: (email: string) => void;
    onOpenVerifyEmail: (email: string) => void;
    onOpenRegister: (email: string) => void;
}

export default function EmailModal({ isOpen, onClose, onOpenLogin, onOpenVerifyEmail, onOpenRegister }: EmailModalProps) {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<{ email?: string }>({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // ✅ Handle email verification and navigation
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setErrors({ email: "Email is required." });

            // ✅ Remove error message after 5 seconds
            setTimeout(() => setErrors({}), 5000);
            return;
        }

        setErrors({});
        setLoading(true);
        setMessage(null);

        try {
            const response = await authService.checkEmail(email);
            setLoading(false);

            if (!response.success) {
                setErrors({ email: response.message });
                setTimeout(() => setErrors({}), 5000);
                return;
            }

            const { exists, verified } = response;

            if (exists) {
                if (verified) {
                    setMessage("Redirecting to login...");
                    setTimeout(() => onOpenLogin(email), 2000);
                } else {
                    setMessage("Redirecting to email verification...");
                    setTimeout(() => onOpenVerifyEmail(email), 2000);
                }
            } else {
                setMessage("Redirecting to registration...");
                setTimeout(() => onOpenRegister(email), 2000);
            }
        } catch (err) {
            setErrors({ email: "Something went wrong. Try again later." });
            setTimeout(() => setErrors({}), 5000);
            setLoading(false);
        }
    }, [email, onOpenLogin, onOpenVerifyEmail, onOpenRegister]);

    return (
        <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        placement="top"
        size="full"
        scrollBehavior="outside"
        classNames={{
          base: "h-[100dvh] m-0",
          wrapper: "h-[100dvh] m-0 p-0",
          body: "p-0",
        }}
        hideCloseButton={true}
      >
        <ModalContent className="m-0 rounded-none h-full flex flex-col">
          <ModalHeader className="text-center text-primary font-bold text-xl flex items-center justify-center gap-2 sticky top-0 bg-white z-10 border-b">
            <Mail className="text-primary w-8 h-8" />
            What's your email?
            <button
    onClick={onClose}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-default-500 hover:text-danger"
  ><X className="w-5 h-5" />

  </button>
          </ModalHeader>
      
          {/* ✅ Make ModalBody scrollable */}
          <ModalBody className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
            <p className="text-gray-500 text-center">
              We’ll check if you have an account associated with <strong>{email || "your email"}</strong>.
            </p>
      
            <Form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 mt-4">
              <Input
                isRequired
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                errorMessage={errors.email}
              />
      
              <Button
                type="submit"
                className="w-full bg-primary text-white flex items-center justify-center gap-2"
                isLoading={loading}
              >
                <Send className="w-5 h-5" />
                Continue
              </Button>
            </Form>
      
            {message && <p className="text-green-600 text-sm text-center mt-3">{message}</p>}
          </ModalBody>
      
          {/* ✅ Sticky footer that doesn't jump above keyboard */}
          <ModalFooter className="sticky bottom-0 bg-white p-4 border-t flex flex-col gap-2 z-10">
            <Button variant="light" className="w-full" onPress={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
    );
}
