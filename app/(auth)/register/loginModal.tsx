"use client";

import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Form, Input, Button } from "@heroui/react";
import { Lock, LogIn } from "lucide-react";
import { signIn } from "next-auth/react"; // ✅ NextAuth integration
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";

export default function LoginModal({ isOpen, email, onClose }) {
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
    
        try {
            const response = await authService.login({ email, password });
    
            if (!response.success) {
                setErrors(response.data);
                setTimeout(() => setErrors({}), 5000);
                return;
            }
    
            await signIn("credentials", { email, password, redirect: false });
    
            // ✅ Redirect to dashboard after successful login
            router.push("/dashboard");
            onClose();
        } catch (err) {
            setErrors({ password: "Invalid credentials. Please try again." });
            setTimeout(() => setErrors({}), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="bottom" size="full">
            <ModalContent>
                <ModalHeader className="text-center text-primary font-bold text-xl flex items-center justify-center gap-2">
                    <Lock className="text-primary w-8 h-8" />
                    Log in with your email
                </ModalHeader>

                <ModalBody className="p-6 flex flex-col items-center">
                    <p className="text-gray-500 text-center">
                        Enter your password for <strong>{email}</strong>
                    </p>

                    <Form onSubmit={handleLogin} className="w-full max-w-md space-y-4 mt-4">
                        <Input
                            isRequired
                            label="Email"
                            name="email"
                            type="email"
                            value={email}
                            disabled
                            errorMessage={errors.email}
                        />

                        <Input
                            isRequired
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            errorMessage={errors.password}
                        />

                        <Button type="submit" className="w-full bg-primary text-white flex items-center justify-center gap-2" isLoading={loading}>
                            <LogIn className="w-5 h-5" />
                            Log in
                        </Button>
                    </Form>
                </ModalBody>

                <ModalFooter className="p-4 border-t flex flex-col gap-2">
                    <Button variant="light" className="w-full text-red-500">Forgot password?</Button>
                    <Button variant="light" className="w-full" onPress={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
