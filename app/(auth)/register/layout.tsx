"use client";

import React from "react";

export default function Layout({ children }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
            {children}
        </div>
    );
}
