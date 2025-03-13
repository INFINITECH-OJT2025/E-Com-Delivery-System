"use client";

import React from "react";
import AuthCard from "../register/authCard";

export default function Page() {
    return (
        <>
            {/* Top Image Section */}
            <div className="w-full h-94 flex justify-center items-center bg-primary">
                <img src="/images/delivery-panda.png" alt="Delivery" className="h-58 object-contain" />
            </div>

            {/* Authentication Card */}
            <AuthCard />
        </>
    );
}
