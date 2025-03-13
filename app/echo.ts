import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";

// ✅ Declare Pusher and Echo in the global window object
declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo;
    }
}

// ✅ Assign Pusher to Window (Fixes global reference issues)
if (typeof window !== "undefined") {
    window.Pusher = Pusher;

    window.Echo = new Echo({
        broadcaster: "pusher", // ✅ Laravel Reverb still uses "pusher" as a broadcaster
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "", // ✅ Match Laravel .env
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "127.0.0.1",
        wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 9000,
        wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 443,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
        enabledTransports: ["ws", "wss"],

        // ✅ Custom authorizer for private & presence channels
        authorizer: (channel: any) => {
            return {
                authorize: async (socketId: string, callback: (error: boolean, data?: any) => void) => {
                    try {
                        const response = await axios.post("/api/broadcasting/auth", {
                            socket_id: socketId,
                            channel_name: channel.name,
                        });

                        callback(false, response.data);
                    } catch (error) {
                        console.error("Error authorizing channel:", error);
                        callback(true, error);
                    }
                },
            };
        },
    });
}

export default window.Echo;
