"use client";

import { useEffect, useState } from "react";
import echo from "@/services/socketService";

export default function WebSocketTest() {
    const [orderUpdate, setOrderUpdate] = useState<string | null>(null);
    const [status, setStatus] = useState("🔄 Connecting...");

    useEffect(() => {
        console.log("✅ Connecting to WebSockets...");

        const token = localStorage.getItem("auth_token");
        const userId = 13; // ✅ Ensure user ID is dynamically set

        if (!token || !userId) {
            console.error("❌ WebSocket Error: Missing auth token or user ID.");
            setStatus("❌ Missing auth token or user ID.");
            return;
        }

        // ✅ Subscribe to the private user order channel
        const channel = echo.private(`orders.${userId}`);

        channel.listen(".order-updated", (data: any) => {
            console.log("🔥 Order Update Received:", data);
            setOrderUpdate(`Order #${data.id} is now ${data.status}`);
        });

        // ✅ Connection status handling
        echo.connector.reverb.connection.bind("connected", () => {
            console.log("✅ Connected to WebSockets!");
            setStatus("✅ Connected to WebSockets");
        });

        echo.connector.reverb.connection.bind("disconnected", () => {
            console.error("❌ WebSocket Disconnected!");
            setStatus("❌ Disconnected");
        });

        // ✅ Cleanup WebSocket listeners on unmount
        return () => {
            console.log("🛑 Unsubscribing from WebSocket...");
            channel.stopListening(".order-updated").unsubscribe();
        };
    }, []);

    return (
        <div className="p-4 border rounded bg-gray-100">
            <h2 className="text-lg font-bold">WebSocket Test</h2>
            <p>Status: {status}</p>
            <p>{orderUpdate || "Waiting for order updates..."}</p>
        </div>
    );
}
