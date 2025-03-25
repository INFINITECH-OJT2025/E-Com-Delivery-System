"use client";

import React, { useState, useCallback } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Form, Input, Button } from "@heroui/react";
import { Lock, LogIn, AlertCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { X } from "lucide-react";

interface LoginModalProps {
    isOpen: boolean;
    email: string;
    onClose: () => void;
}

export default function LoginModal({ isOpen, email, onClose }: LoginModalProps) {
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setErrors({});

        try {
            const response = await authService.login({ email, password });

            if (!response.success) {
                setErrors({
                    ...response.data,
                    general: response.message || "Invalid credentials. Please try again.",
                });

                // ✅ Auto-remove error messages after 5 seconds
                setTimeout(() => setErrors({}), 5000);
                return;
            }

            // ✅ Redirect after successful login
            router.push("/home");
            onClose();
        } catch (err) {
            setErrors({ general: "Something went wrong. Please try again." });

            setTimeout(() => setErrors({}), 5000);
        } finally {
            setLoading(false);
        }
    }, [email, password, router, onClose]);

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
>
<ModalContent className="m-0 rounded-t-xl h-full flex flex-col">
                {/* ✅ Header */}
                <ModalHeader className="text-center text-primary font-bold text-xl flex items-center justify-center gap-2 relative">
  <Lock className="text-primary w-8 h-8" />
  Log in with your email


</ModalHeader>


                {/* ✅ Body */}
                <ModalBody className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                <p className="text-gray-500 text-center">
                        Enter your password for <strong>{email}</strong>
                    </p>

                    {/* ✅ Error Message Display */}
                    {errors.general && (
                        <div className="w-full max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm text-center mt-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> {errors.general}
                        </div>
                    )}

                    <Form onSubmit={handleLogin} className="w-full max-w-md space-y-4 mt-4">
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={email}
                            disabled
                            errorMessage={errors.email}
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            errorMessage={errors.password}
                            isRequired
                        />

                        <Button
                            type="submit"
                            className="w-full bg-primary text-white flex items-center justify-center gap-2"
                            isLoading={loading}
                            isDisabled={loading} // ✅ Prevent multiple clicks
                        >
                            <LogIn className="w-5 h-5" />
                            Log in
                        </Button>
                    </Form>
                </ModalBody>

                {/* ✅ Footer */}
                <ModalFooter className="sticky bottom-0 bg-white border-t p-4 flex flex-col gap-2 z-10">
  <Button 
    variant="light" 
    className="w-full text-red-500" 
    onPress={() => setIsForgotPasswordOpen(true)}
  >
    Forgot password?
  </Button>                      
  <Button variant="light" className="w-full" onPress={onClose}>Cancel</Button>
</ModalFooter>

            </ModalContent>

            {/* ✅ Forgot Password Modal */}
            <ForgotPasswordModal
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
            />
        </Modal>
    );
}
