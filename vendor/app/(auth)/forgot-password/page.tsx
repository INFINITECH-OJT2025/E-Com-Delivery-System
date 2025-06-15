"use client";

import React, { useState } from "react";
import { Input, Button, Card, CardBody } from "@heroui/react";
import { Mail, Send } from "lucide-react";
import { authService } from "@/services/authService";

export default function ForgotPasswordPage() {
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
        setMessage("✅ A password reset link has been sent to your email.");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md shadow-xl bg-white dark:bg-gray-800">
        <CardBody className="p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <Mail className="text-primary w-10 h-10 mb-2" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Forgot Password</h1>
            <p className="text-gray-500 mt-1">
              Enter your email to receive a password reset link.
            </p>
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired
            className="w-full"
          />

          {errorMessage && (
            <p className="text-red-500 text-sm mt-3 text-center">{errorMessage}</p>
          )}
          {message && (
            <p className="text-green-600 text-sm mt-3 text-center">{message}</p>
          )}

          <Button
            className="w-full mt-6 bg-primary text-white flex items-center justify-center gap-2"
            onPress={handleResetRequest}
            isLoading={loading}
          >
            <Send className="w-5 h-5" />
            Send Reset Link
          </Button>

          <div className="text-center mt-4">
            <a href="/login" className="text-sm text-primary hover:underline">
              Back to Login
            </a>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
