"use client";

import { useState } from "react";
import { Button, Card, CardBody, Input, Spinner } from "@heroui/react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import { RiderAuthService } from "@/services/riderAuthService";

export default function RiderLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await RiderAuthService.login(formData.email, formData.password);
      if (response.status === "success") {
        addToast({
          title: "✅ Success",
          description: "Logged in successfully!",
          color: "success",
        });
        router.push("/dashboard");
      } else {
        addToast({
          title: "❌ Login Failed",
          description: response.message || "Invalid credentials",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "⚠ Error",
        description: "Something went wrong. Try again later.",
        color: "warning",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary p-4">
      {/* Logo Section */}
      <div className="mb-6">
        <img src="/images/delivery-panda.png" alt="E-Com Delivery" className="w-24 h-24 rounded-full shadow-md bg-white" />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold text-center text-primary">Rider Login</h2>
        <p className="text-gray-500 text-center mb-4">Sign in to start delivering</p>

        <CardBody>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="Email" type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} isRequired />
            <Input label="Password" type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} isRequired />

            {/* Login Button */}
            <Button type="submit" color="primary" className="w-full" isDisabled={loading}>
              {loading ? <Spinner size="sm" /> : "Login"}
            </Button>
          </form>

          {/* Forgot Password */}
          <p className="text-gray-500 text-center text-sm mt-4">
            <a href="#" className="text-secondary font-medium">Forgot password?</a>
          </p>

          {/* Divider */}
          <div className="my-4 border-b border-gray-300"></div>

          {/* Social Login */}
          <Button className="w-full flex items-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100">
            <FcGoogle className="text-xl" />
            Continue with Google
          </Button>
          <Button className="w-full flex items-center gap-2 bg-blue-600 text-white mt-2 hover:bg-blue-700">
            <FaFacebook className="text-xl" />
            Continue with Facebook
          </Button>
          <Button className="w-full flex items-center gap-2 bg-black text-white mt-2 hover:bg-gray-900">
            <FaApple className="text-xl" />
            Continue with Apple
          </Button>

          {/* Sign Up Link */}
          <p className="text-gray-500 text-center text-sm mt-4">
            Don’t have an account? <a href="/register" className="text-secondary font-medium">Sign up</a>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
