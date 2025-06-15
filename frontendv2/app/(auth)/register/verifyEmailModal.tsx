"use client";

import React, { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, InputOtp } from "@heroui/react";
import { CheckCircle, Mail, RefreshCw, Send, X } from "lucide-react";
import { authService } from "@/services/authService";
import LoginModal from "./loginModal"; // ✅ Import LoginModal

interface VerifyEmailModalProps {
    isOpen: boolean;
    email: string;
    onClose: () => void; // ✅ No need for onOpenLogin now
}

export default function VerifyEmailModal({ isOpen, email, onClose }: VerifyEmailModalProps) {
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // ✅ Control LoginModal state

    // ✅ Handle OTP Submission
    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setErrorMessage("OTP must be 6 digits.");
            return;
        }

        setOtpLoading(true);
        setMessage(null);
        setErrorMessage(null);

        try {
            const response = await authService.verifyOtp({ email, otp });

            if (response.success) {
                setIsVerified(true);
                setMessage("Verification successful! Redirecting to login...");

                // ✅ Close this modal and open login modal
                setTimeout(() => {
                    onClose();
                    setTimeout(() => setIsLoginModalOpen(true), 300); // ✅ Open login modal
                }, 2000);
            } else {
                setErrorMessage(response.message || "Invalid OTP. Please try again.");
            }
        } catch {
            setErrorMessage("Failed to verify OTP. Try again.");
        } finally {
            setOtpLoading(false);
        }
    };

    // ✅ Resend Verification (Always sends both OTP & email verification link)
    const handleResendVerification = async () => {
        setLoading(true);
        setMessage(null);
        setErrorMessage(null);

        try {
            const response = await authService.resendVerification({ email });

            if (response.status === "error") {
                setErrorMessage(response.data?.email?.[0] || response.message || "Failed to resend verification.");
            } else {
                setMessage("Verification email and OTP resent. Check your inbox.");
            }
        } catch {
            setErrorMessage("Failed to resend verification email. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ✅ Verify Email Modal */}
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
      {isVerified ? (
        <CheckCircle className="text-green-500 w-8 h-8" />
      ) : (
        <Mail className="text-primary w-8 h-8" />
      )}
      Verify Your Email
      <button
        onClick={onClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-default-500 hover:text-danger"
      >
        <X className="w-5 h-5" />
      </button>
    </ModalHeader>

    {/* ✅ Body with scroll support */}
    <ModalBody className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
      {isVerified ? (
        <p className="text-green-600 text-center font-semibold">{message}</p>
      ) : (
        <>
          <p className="text-gray-500 text-center">
            We’ve sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
          </p>

          <p className="text-gray-600 mt-4 text-center">Or enter the OTP sent to your email:</p>

          <InputOtp
            length={6}
            isRequired
            color="primary"
            value={otp}
            onValueChange={setOtp}
            className="mt-2 w-3/4 text-center"
            placeholder="Enter OTP"
          />

          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

          <Button
            className="w-full bg-primary text-white mt-4 flex items-center justify-center gap-2"
            onPress={handleVerifyOtp}
            isLoading={otpLoading}
          >
            <Send className="w-5 h-5" /> Verify OTP
          </Button>
        </>
      )}

      {!isVerified && message && <p className="text-green-600 text-sm text-center mt-3">{message}</p>}
    </ModalBody>

    {/* ✅ Sticky Footer */}
    {!isVerified && (
      <ModalFooter className="sticky bottom-0 bg-white border-t p-4 flex flex-col gap-2 z-10">
        <Button
          className="w-full bg-secondary text-white flex items-center justify-center gap-2"
          onPress={handleResendVerification}
          isLoading={loading}
        >
          <RefreshCw className="w-5 h-5" /> Resend Verification Email & OTP
        </Button>
        <Button variant="light" className="w-full" onPress={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    )}
  </ModalContent>
</Modal>


            {/* ✅ Open Login Modal directly after verification */}
            <LoginModal 
                isOpen={isLoginModalOpen} 
                email={email} 
                onClose={() => setIsLoginModalOpen(false)} 
            />
        </>
    );
}
