"use client";
import React from "react";

import { useState } from "react";
import { Button, Card, CardBody, Input, Spinner } from "@heroui/react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import { RiderAuthService } from "@/services/riderAuthService";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
// import GoogleLoginPopupButton from "@/components/GoogleLoginPopupButton";
import {EyeSlashFilledIcon, EyeFilledIcon } from "@/components/icons";
import GoogleLoginPopupButton from "@/components/GoogleLoginPopupButton";
import { authService } from "@/services/authService";
export default function RiderLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [isForgotOpen, setForgotOpen] = useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
  const handleGooglePopupLogin = async (userInfo: any) => {
    const result = await authService.loginWithGoogle(userInfo);
  
    if (result.success) {
      // ✅ Store token and user info
      localStorage.setItem("riderToken", result.data.access_token);
      localStorage.setItem("rider", JSON.stringify(result.data.user));
  
      // ✅ Redirect to rider dashboard
      router.push("/dashboard");
  
      addToast({
        title: "✅ Welcome",
        description: `Logged in as ${result.data.user.name}`,
        color: "success",
      });
    } else {
      // ❌ Show backend message (like: "This login is for riders only.")
      addToast({
        title: "❌ Login Failed",
        description: result.message || "Something went wrong. Please try again.",
        color: "danger",
      });
    }
  };
  return (
<div
  className="min-h-screen flex flex-col items-center justify-center bg-primary bg-cover bg-center p-4"
  // style={{
  //   backgroundImage: "url('/images/blob-scene-haikei-2.svg')"
  // }}
>



      <Card className="w-full max-w-md p-0 overflow-hidden rounded-2xl shadow-lg">
        <CardBody className="p-6 bg-white">
        <h3 className="text-xl font-bold text-center text-primary mb-2">E-Com Delivery <strong className="text-red-500">Rider</strong></h3>

          <div className="flex justify-center mb-4">
            
        <img
    src="/images/delivery-panda.png"
    alt="Rider Logo"
    className="w-40 h-40 object-fill"
  />
  </div>
          <p className="text-center text-gray-500 mb-4">Login and start earning</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="Email" name="email" type="email" placeholder="Enter email" value={formData.email} onChange={handleChange} isRequired />
            <Input label="Password" name="password"  endContent={
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
      }  type={isVisible ? "text" : "password"} placeholder="Enter password" value={formData.password} onChange={handleChange} isRequired />
            <Button type="submit" color="primary" className="w-full" isDisabled={loading}>
              {loading ? "Logging in ...." : "Login"}
            </Button>
          </form>

          <p className="text-sm text-center mt-3 text-gray-500">
            <button onClick={() => setForgotOpen(true)} className="text-secondary font-medium">Forgot password?</button>
          </p>

          <div className="my-4 border-t"></div>

          <GoogleLoginPopupButton onLogin={handleGooglePopupLogin} />


          <div className="relative opacity-60 mt-2">
  <Button className="w-full flex items-center gap-2 bg-blue-600 text-white" isDisabled>
    <FaFacebook className="text-xl" />
    Continue with Facebook
  </Button>
  <span className="absolute top-0 right-0 text-xs bg-red-500 text-white px-2 py-0.5 rounded-tr-md rounded-bl-md shadow-md z-10">
    Currently unavailable
  </span>
</div>

<div className="relative opacity-60 mt-2">
  <Button className="w-full flex items-center gap-2 bg-black text-white" isDisabled>
    <FaApple className="text-xl" />
    Continue with Apple
  </Button>
  <span className="absolute top-0 right-0 text-xs bg-red-500 text-white px-2 py-0.5 rounded-tr-md rounded-bl-md shadow-md z-10">
    Currently unavailable
  </span>
</div>


          <p className="text-sm text-center mt-4 text-gray-500">
            Don’t have an account?{" "}
            <a href="/register" className="text-secondary font-semibold">Sign up</a>
          </p>
        </CardBody>
      </Card>

      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
