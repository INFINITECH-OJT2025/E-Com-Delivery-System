"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Onboarding from "@/components/Onboarding";

export default function MainPage() {
    const [isFirstVisit, setIsFirstVisit] = useState(false);

    useEffect(() => {
        const hasVisited = localStorage.getItem("hasVisited");

        if (hasVisited) {
            redirect("/home"); // 🚀 Redirect returning users to Home
        } else {
            setIsFirstVisit(true);
        }
    }, []);

    if (!isFirstVisit) return null; // ✅ Prevents flickering while checking

    return <Onboarding />;
}
