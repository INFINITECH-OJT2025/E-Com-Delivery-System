"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import Image from "next/image";

export default function Onboarding() {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100); // Smooth fade-in
    }, []);

    const handleGetStarted = () => {
        localStorage.setItem("hasVisited", "true"); // ✅ Mark as visited
        router.push("/home"); // 🚀 Redirect to home
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-primary text-white px-6 transition-opacity duration-500" style={{ opacity: isVisible ? 1 : 0 }}>
            {/* 🏆 Logo & Welcome */}
            <div className="text-center">
                <Image src="/images/delivery-panda.png" alt="App Logo" width={100} height={100} className="mx-auto" />
                <h1 className="text-4xl font-bold mt-4">Welcome to E-Com Delivery</h1>
                <p className="text-lg text-gray-200 mt-2">Fast, Reliable, and Convenient Food Delivery</p>
            </div>

            {/* 🚀 Features */}
            <div className="mt-10 space-y-6">
                <FeatureItem icon="🍔" title="Order From Top Restaurants" description="Find your favorite food from the best local spots." />
                <FeatureItem icon="🚴‍♂️" title="Fast & Safe Delivery" description="Track your order in real-time and enjoy fast delivery." />
                <FeatureItem icon="💳" title="Multiple Payment Options" description="Pay with GCash, Maya, Card, or Cash on Delivery." />
            </div>

            {/* 🎯 Get Started Button */}
            <Button className="bg-white text-primary font-bold px-6 py-3 rounded-full mt-10" onPress={handleGetStarted}>
                Get Started
            </Button>
        </div>
    );
}

function FeatureItem({ icon, title, description }) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-3xl">{icon}</span>
            <div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="text-gray-300 text-sm">{description}</p>
            </div>
        </div>
    );
}
