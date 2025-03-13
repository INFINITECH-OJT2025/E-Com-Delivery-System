"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6">
            <h1 className="text-5xl font-bold text-gray-900">404</h1>
            <p className="text-lg text-gray-600">Oops! The page you are looking for does not exist.</p>

            <Button 
                className="bg-primary text-white px-6 py-2"
                onPress={() => router.push("/home")} // ✅ Navigate to home on button press
            >
                Go Home
            </Button>
        </div>
    );
}
