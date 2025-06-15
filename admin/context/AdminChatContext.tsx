'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { fetchActiveChats } from '@/services/chatService';

interface ChatMessage {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Chat {
  id: number;
  sender: {
    id: number;
    name: string;
  };
  messages: ChatMessage[];
}

interface AdminChatContextType {
  selectedChatId: number | null;
  setSelectedChatId: (id: number | null) => void;
  chats: Chat[];
  unreadCount: number;
  refreshChats: () => Promise<void>;
}

const AdminChatContext = createContext<AdminChatContextType | undefined>(undefined);

export const AdminChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshChats = async () => {
    const response = await fetchActiveChats();
    if (response.success) {
      setChats(response.chats);
  
      // ✅ Use has_unread field from backend
      const totalUnread = response.chats.filter((chat) => chat.has_unread).length;
  
      setUnreadCount(totalUnread);
    }
  };
  

  useEffect(() => {
    refreshChats();
  }, []);

  return (
    <AdminChatContext.Provider
      value={{ selectedChatId, setSelectedChatId, chats, unreadCount, refreshChats }}
    >
      {children}
    </AdminChatContext.Provider>
  );
};

export const useAdminChat = () => {
  const context = useContext(AdminChatContext);
  if (!context) throw new Error('useAdminChat must be used within AdminChatProvider');
  return context;
};
