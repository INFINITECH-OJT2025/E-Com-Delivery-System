"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Input, Button, Card } from "@heroui/react";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const response = await authService.login(email, password);

    if (response.status === "success") {
      router.push("/admin/dashboard");
    } else {
      setError(response.message);
    }

    setLoading(false);
  };

  return (
    <div className="relative flex items-center justify-center h-screen w-full bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')" }}>
      {/* ✅ Overlay to Improve Visibility */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* ✅ Login Form on the Left Side */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Admin Login</h2>
        <p className="text-sm text-gray-500 text-center mb-4">Sign in to manage the system</p>

        {/* ✅ Error Message */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* ✅ Email Input */}
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* ✅ Password Input */}
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* ✅ Login Button */}
          <Button type="submit" color="primary" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
