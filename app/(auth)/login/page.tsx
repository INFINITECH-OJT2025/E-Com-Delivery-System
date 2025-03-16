"use client";

import { useState } from "react";
import { useVendorAuth } from "@/context/AuthContext";
import { Button, Card, CardBody, Input } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";

export default function VendorLogin() {
  const { login } = useVendorAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      // If login is successful, we check the 'status' instead of 'success'
      if (result.status === "success") {
        addToast({ title: "Login Successful", description: "Welcome back!", color: "success" });
        router.push("/dashboard"); // Redirect after successful login
      } else {
        addToast({ title: "Login Failed", description: result.message || "Invalid credentials", color: "danger" });
      }
    } catch (error) {
      addToast({ title: "Login Failed", description: "Something went wrong, please try again.", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center bg-cover bg-center h-screen px-4" style={{ backgroundImage: 'url("/images/we-serve-best-cakes.jpg")' }}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 text-white text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Transform your business with Panda Partner</h1>
        <p className="text-xl mb-8">
          Sign in and unlock the benefits of being a partner with E-com delivery service.
        </p>
      </div>
      <Card className="w-full max-w-lg shadow-lg p-6">
        <CardBody>
          <h2 className="text-2xl font-bold text-center mb-6">Vendor Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full bg-primary" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <div className="flex justify-between text-sm mt-4">
            <a href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </a>
            <p>
              <span>Don't have an account? </span>
              <a href="/register" className="text-primary hover:underline">
                Partner with Foodpanda
              </a>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
