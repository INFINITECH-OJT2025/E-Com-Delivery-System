import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ✅ Fetches all user chats for the admin
export async function fetchUserChats() {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, chats: [] };

    try {
        const res = await axios.get(`${API_URL}/api/admin/chats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return res.data;
    } catch (error) {
        console.error("Error fetching user chats:", error);
        return { success: false, chats: [], message: "Failed to fetch chats" };
    }
}

// ✅ Fetches messages for a specific chat (User-Admin conversation)
export async function fetchMessages(chatId: number) {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, messages: [] };

    try {
        const res = await axios.get(`${API_URL}/api/chat/messages/${chatId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return res.data;
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        return { success: false, messages: [], message: "Failed to load messages" };
    }
}

// ✅ Admin sends a message to a user
export async function sendAdminMessage(chatId: number, message: string) {
    const token = localStorage.getItem("adminToken");
    if (!token) return { success: false, message: "Unauthorized" };

    try {
        const res = await axios.post(`${API_URL}/api/admin/chat/send`, { chatId, message }, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        return res.data;
    } catch (error) {
        console.error("Error sending message:", error);
        return { success: false, message: "Failed to send message" };
    }
}
