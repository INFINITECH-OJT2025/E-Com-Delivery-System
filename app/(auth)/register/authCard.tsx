"use client";

import React, { useState } from "react";
import { Button, Card } from "@heroui/react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple, FaEnvelope } from "react-icons/fa";
import EmailModal from "./emailModal";

export default function AuthCard() {
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    return (
        <>
            {/* Main Authentication Card */}
            <Card className="w-full max-w-md p-6 bg-white rounded-t-xl shadow-lg absolute bottom-0">
                <h2 className="text-2xl font-bold text-center text-primary">Sign up or log in</h2>
                <p className="text-gray-500 text-center mb-4">Select your preferred method to continue</p>

                {/* Social Login Buttons */}
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

                {/* Divider */}
                <div className="my-4 border-b border-gray-300"></div>

                {/* Continue with Email Button */}
                <Button
                    className="w-full flex items-center gap-2 bg-secondary text-white mt-2 hover:bg-secondary/80"
                    onPress={() => setIsEmailModalOpen(true)}
                >
                    <FaEnvelope className="text-xl" />
                    Continue with Email
                </Button>

                <p className="text-gray-500 text-center text-sm mt-4">
                    By signing up you agree to our <a href="#" className="text-secondary">Terms and Conditions</a> and <a href="#" className="text-secondary">Privacy Policy</a>.
                </p>
            </Card>

            {/* Email Modal Component */}
            <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
        </>
    );
}
