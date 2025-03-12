import Echo from "laravel-echo";
import Pusher from "pusher-js";

// ✅ Ensure WebSocket connection matches Laravel Reverb
const REVERB_URL = process.env.NEXT_PUBLIC_REVERB_URL || "ws://127.0.0.1:9000";

// ✅ Override Pusher to use WebSockets directly (Reverb doesn’t use "cluster")
Pusher.Runtime.createWebSocket = (url) => new WebSocket(url);

const echo = new Echo({
    broadcaster: "pusher",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "23482213344", // ✅ Match Laravel .env
    wsHost: "127.0.0.1",
    wsPort: 9000, // ✅ Make sure it matches Laravel Reverb port
    forceTLS: false,
    disableStats: true,
    enabledTransports: ["ws", "wss"], // ✅ Explicitly allow WebSockets
});

export default echo;
