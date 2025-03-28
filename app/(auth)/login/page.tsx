"use client";

import { useState } from "react";
import { useVendorAuth } from "@/context/AuthContext";
import { Button, Card, CardBody, Input } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import React from "react";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/passwordIcons";
export default function VendorLogin() {
  const { login } = useVendorAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result?.status === "success") {
        addToast({
          title: "Login Successful",
          description: "Welcome back!",
          color: "success",
        });
        router.push("/dashboard");
      } else {
        addToast({
          title: "Login Failed",
          description: result?.message || "Invalid credentials",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      addToast({
        title: "Login Failed",
        description: "Unexpected error. Please try again.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  return (
    <div
      className="relative flex flex-col lg:flex-row items-center justify-center bg-cover bg-center min-h-screen px-4 py-10 overflow-y-auto"
      style={{ backgroundImage: 'url("/images/we-serve-best-cakes.jpg")' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
  
      {/* Promo Section (left) */}
      <div className="hidden lg:flex flex-col justify-center items-center text-center px-8 z-10 text-white w-1/2 h-full">
        <div className="max-w-md">

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Transform your business with E-Com Partner
          </h1>
          <p className="text-xl font-medium">
            Sign in and unlock the benefits of being a partner with E-com delivery service.
          </p>
        </div>
      </div>
  
      {/* Login Card */}
      <Card className="relative z-10 w-full lg:w-1/2 max-w-lg shadow-lg p-6 bg-white dark:bg-gray-900">
        <CardBody>
          <h2 className="text-2xl font-bold text-center mb-6">Vendor Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full"
            />
            <Input
              type={isVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full"
              endContent={
                <button
                  aria-label="toggle password visibility"
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
            />
            <Button type="submit" className="w-full bg-primary" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>
  
          <div className="flex flex-col sm:flex-row justify-between text-sm mt-4 gap-2">
            <a href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </a>
            <p className="text-center sm:text-right">
              <span>Don't have an account? </span>
              <a href="/register" className="text-primary hover:underline">
                Partner with E-com Delivery Service
              </a>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}  
function setIsVisible(arg0: boolean) {
  throw new Error("Function not implemented.");
}

