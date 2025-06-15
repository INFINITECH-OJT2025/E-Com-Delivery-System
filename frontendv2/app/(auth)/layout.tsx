"use client";

import React, { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
            {children}
        </div>
    );
}
