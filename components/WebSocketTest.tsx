"use client";

import { useEffect, useState } from "react";
import echo from "@/services/socketService";

export default function WebSocketTest() {
    const [orderUpdate, setOrderUpdate] = useState<string | null>(null);

    useEffect(() => {
        console.log("✅ Connecting to Laravel Reverb WebSockets...");

        // ✅ Listen for real-time order updates (Change "1" to the actual order ID)
        echo.channel(`order.1`).listen("OrderUpdated", (data: any) => {
            console.log("🔥 Order Update Received:", data);
            setOrderUpdate(`Order #${data.id} is now ${data.status}`);
        });

        return () => {
            echo.leaveChannel(`order.1`); // ✅ Unsubscribe when component unmounts
        };
    }, []);

    return (
        <div className="p-4 border rounded bg-gray-100">
            <h2 className="text-lg font-bold">WebSocket Test</h2>
            <p>{orderUpdate || "Waiting for order updates..."}</p>
        </div>
    );
}
