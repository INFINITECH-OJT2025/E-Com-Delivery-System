"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    Input,
    Button,
} from "@heroui/react";
import { Eye, EyeOff, UserPlus, Send } from "lucide-react";
import VerifyEmailModal from "./verifyEmailModal";
import { authService } from "@/services/authService";
import { validateEmail, validatePassword, validatePhone, validateConfirmPassword, ValidationErrors } from "@/utils/validation";
import { X } from "lucide-react";
interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    email?: string;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, email }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: email || "",
        phone_number: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [apiErrors, setApiErrors] = useState<string[]>([]);

    useEffect(() => {
        setFormData((prev) => ({ ...prev, email }));
    }, [email]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        let errorMsg = "";
        if (name === "email") errorMsg = validateEmail(value);
        if (name === "phone_number") errorMsg = validatePhone(value);
        if (name === "password") errorMsg = validatePassword(value);
        if (name === "confirmPassword") errorMsg = validateConfirmPassword(formData.password, value);

        setErrors((prev) => ({ ...prev, [name]: errorMsg }));

        // ✅ Automatically remove error after 5 seconds
        if (errorMsg) {
            setTimeout(() => {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }, 5000);
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
    
        // ✅ Clear previous API errors
        setApiErrors([]);
    
        setLoading(true);
        setErrors({});
    
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password,
                password_confirmation: formData.confirmPassword,
            };
    
            const response = await authService.register(payload);
            setLoading(false);
    
            if (!response.success) {
                if (response.data) {
                    // ✅ Store API response errors separately
                    setApiErrors(Object.values(response.data).flat());
                    return;
                }
            }
    
            setIsVerifying(true);
        } catch (err) {
            setLoading(false);
        }
    }, [formData]);
    

    return (
        <>
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
      <ModalContent className="m-0 rounded-t-xl h-full flex flex-col">
        {/* ✅ Header with Close Button */}
        <ModalHeader className="text-center text-primary font-bold text-xl flex items-center justify-center gap-2 relative">
          <UserPlus className="text-primary w-8 h-8" />
          Create an Account
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-default-500 hover:text-danger"
          >
            <X className="w-5 h-5" />
          </button>
        </ModalHeader>

        {/* ✅ Body with Scroll */}
        <ModalBody className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          {apiErrors?.length > 0 && (
            <div className="w-full max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm text-center mb-4">
              {apiErrors.map((error: string, index: number) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          <p className="text-gray-500 text-center mb-4">
            Fill in your details to create an account.
          </p>

          <Form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <Input
              isRequired
              label="Full Name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              errorMessage={errors.name}
            />

            <Input
              isRequired
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              errorMessage={errors.email}
            />

            <Input
              isRequired
              label="Phone Number"
              name="phone_number"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone_number}
              onChange={handleChange}
              errorMessage={errors.phone_number}
            />

            <Input
              isRequired
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter a secure password"
              value={formData.password}
              onChange={handleChange}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              errorMessage={errors.password}
            />

            <Input
              isRequired
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              errorMessage={errors.confirmPassword}
            />

            <Button
              type="submit"
              className="w-full bg-primary text-white flex items-center justify-center gap-2"
              isLoading={loading}
            >
              <Send className="w-5 h-5" />
              Register
            </Button>
          </Form>
        </ModalBody>

        {/* ✅ Sticky Footer */}
        <ModalFooter className="sticky bottom-0 bg-white border-t p-4 flex flex-col gap-2 z-10">
          <Button variant="light" className="w-full" onPress={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

            {/* ✅ Open Verify Email Modal when registration is successful */}
            <VerifyEmailModal isOpen={isVerifying} email={formData.email} onClose={() => setIsVerifying(false)} />
        </>
    );
};

export default RegisterModal;
