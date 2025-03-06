"use client";

import { addToast } from "@heroui/react";

/**
 * Custom hook to show toast notifications.
 */
export const useToast = () => {
    return {
        success: (message: string) => {
            addToast({
                title: "Success",
                description: message,
                color: "success",
                variant: "flat",
                timeout: 5000,
            });
        },
        error: (message: string) => {
            addToast({
                title: "Error",
                description: message,
                color: "danger",
                variant: "flat",
                timeout: 5000,
            });
        },
        warning: (message: string) => {
            addToast({
                title: "Warning",
                description: message,
                color: "warning",
                variant: "flat",
                timeout: 5000,
            });
        },
        info: (message: string) => {
            addToast({
                title: "Info",
                description: message,
                color: "primary",
                variant: "flat",
                timeout: 5000,
            });
        },
    };
};
