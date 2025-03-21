import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const chatService = {
  async startChat() {
    const token = localStorage.getItem("auth_token");
    if (!token) return { success: false, message: "Unauthorized" };
    
    const response = await axios.post(`${API_BASE}/api/chat/start`, {}, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async fetchMessages(chatId: number) {
    const token = localStorage.getItem("auth_token");
    if (!token) return { success: false, message: "Unauthorized" };

    const response = await axios.get(`${API_BASE}/api/chat/messages/${chatId}`, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async sendMessage(chatId: number, message: string) {
    const token = localStorage.getItem("auth_token");
    if (!token) return { success: false, message: "Unauthorized" };

    const response = await axios.post(`${API_BASE}/api/chat/send`, {
      chat_id: chatId,
      message,
    }, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  },

  async testSend(message: string) {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return { success: false, message: "Unauthorized" };

      const response = await axios.post(`${API_BASE}/api/chat/test`, { message }, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      return { success: false };
    }
  },
};
