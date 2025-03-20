const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api";

export async function fetchChatMessages() {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return { success: false, messages: [] };

    try {
        const res = await fetch(`${API_URL}/api/chat/messages`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        });

        if (!res.ok) {
            return { success: false, messages: [], message: "Failed to fetch messages" };
        }

        const data = await res.json();
        return { success: true, messages: data.messages };
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        return { success: false, messages: [], message: "Error retrieving messages" };
    }
}

export async function sendChatMessage(message: string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return { success: false, message: "Unauthorized" };

    try {
        const res = await fetch(`${API_URL}/api/chat/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
        });

        if (!res.ok) {
            return { success: false, message: "Failed to send message" };
        }

        const data = await res.json();
        return { success: true, message: data.message };
    } catch (error) {
        console.error("Error sending chat message:", error);
        return { success: false, message: "Error sending message" };
    }
}