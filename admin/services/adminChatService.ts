import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const adminChatService = {
  async getActiveChats() {
    const token = localStorage.getItem('auth_token');
    return axios
      .get(`${API_BASE}/api/chat/active-chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      .then((res) => res.data)
      .catch(() => ({ success: false }));
  },

  async getMessages(chatId: number) {
    const token = localStorage.getItem('auth_token');
    return axios
      .get(`${API_BASE}/api/chat/messages/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      .then((res) => res.data)
      .catch(() => ({ success: false }));
  },

  async sendSupportMessage(chatId: number, message: string) {
    const token = localStorage.getItem('auth_token');
    return axios
      .post(
        `${API_BASE}/api/chat/send-support`,
        { chat_id: chatId, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => res.data)
      .catch(() => ({ success: false }));
  },
};
