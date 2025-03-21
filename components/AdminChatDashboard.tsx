'use client';

import React, { useEffect, useState } from 'react';
import { fetchActiveChats } from '@/services/supportService';

const AdminChatDashboard = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    const response = await fetchActiveChats();
    if (response.success) {
      setChats(response.chats);
    }
  };

  const handleSelectChat = async (chatId) => {
    onSelectChat(chatId);
    await loadChats(); // Refresh chat list to remove unread messages after opening
  };

  return (
    <div >
      {chats.length > 0 ? (
        chats.map((chat) => {
          const lastMessage = chat.messages.length > 0 ? chat.messages[0] : null;
          const unreadCount = chat.messages.filter((msg) => !msg.is_read).length;
          return (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className="flex justify-between items-center w-full text-left p-3 border-b hover:bg-gray-100 rounded-md transition duration-200"
            >
              <div>
                <p className="font-bold text-lg">{chat.sender.name}</p>
                <p className="text-sm text-gray-600">
                  {lastMessage ? lastMessage.message : "No messages yet"}
                </p>
                {lastMessage && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(lastMessage.created_at).toLocaleString()}
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </button>
          );
        })
      ) : (
        <p className="text-gray-500">No active chats</p>
      )}
    </div>
  );
};

export default AdminChatDashboard;
