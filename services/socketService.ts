import Echo from "laravel-echo";

// ✅ Ensure Laravel Reverb is used (not Pusher)
const echo = new Echo({
    broadcaster: "reverb",
    host: process.env.NEXT_PUBLIC_REVERB_HOST || "127.0.0.1",
    port: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 9000,
    secure: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https", // Use HTTPS if defined
    enabledTransports: ["ws", "wss"], // Only allow WebSocket connections
    disableStats: true, // Avoids unnecessary API calls
    authorizer: (channel) => {
        return {
            authorize: async (socketId, callback) => {
                try {
                    const token = localStorage.getItem("auth_token");

                    if (!token) {
                        console.error("❌ WebSocket Auth Failed: No auth token.");
                        callback(true, { error: "Unauthorized" });
                        return;
                    }

                    console.log(`🔄 Authorizing WebSocket Channel: ${channel.name}`);

                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/broadcasting/auth`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                socket_id: socketId,
                                channel_name: channel.name,
                            }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`❌ Failed to authorize: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log("✅ WebSocket Auth Success", data);
                    callback(false, data);
                } catch (error) {
                    console.error("❌ WebSocket Auth Error:", error);
                    callback(true, error);
                }
            },
        };
    },
});

// ✅ Log WebSocket connection status
echo.connector.reverb.connection.bind("connected", () => {
    console.log("✅ WebSocket Connected!");
});

echo.connector.reverb.connection.bind("disconnected", () => {
    console.error("❌ WebSocket Disconnected!");
});

echo.connector.reverb.connection.bind("error", (error: any) => {
    console.error("❌ WebSocket Error:", error);
});

export default echo;
