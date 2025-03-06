"use client";

import React, { useState, useCallback } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Form, Input, Button } from "@heroui/react";
import { Lock, LogIn } from "lucide-react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";

interface LoginModalProps {
    isOpen: boolean;
    email: string;
    onClose: () => void;
}

export default function LoginModal({ isOpen, email, onClose }: LoginModalProps) {
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setErrors({});

        try {
            const response = await authService.login({ email, password });

            if (!response.success) {
                setErrors(response.data);
                setTimeout(() => setErrors({}), 5000);
                return;
            }

            // ✅ Redirect after successful login
            router.push("/dashboard");
            onClose();
        } catch (err) {
            setErrors({ password: "Invalid credentials. Please try again." });
            setTimeout(() => setErrors({}), 5000);
        } finally {
            setLoading(false);
        }
    }, [email, password, router, onClose]);

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="bottom" size="full">
            <ModalContent>
                {/* ✅ Header */}
                <ModalHeader className="text-center text-primary font-bold text-xl flex items-center justify-center gap-2">
                    <Lock className="text-primary w-8 h-8" />
                    Log in with your email
                </ModalHeader>

                {/* ✅ Body */}
                <ModalBody className="p-6 flex flex-col items-center">
                    <p className="text-gray-500 text-center">
                        Enter your password for <strong>{email}</strong>
                    </p>

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
                <ModalFooter className="p-4 border-t flex flex-col gap-2">
                    <Button variant="light" className="w-full text-red-500">Forgot password?</Button>
                    <Button variant="light" className="w-full" onPress={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
