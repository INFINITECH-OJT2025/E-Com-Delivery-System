'use client';

import React from 'react';
import { useAdminChat } from '@/context/AdminChatContext';

const AdminChatDashboard = () => {
  const { chats, selectedChatId, setSelectedChatId, refreshChats } = useAdminChat();

  const handleSelectChat = async (chatId: number) => {
    setSelectedChatId(chatId);
    await refreshChats();
  };

  return (
    <div className="h-full overflow-y-auto space-y-2 pr-2">
      {chats.length > 0 ? (
        chats.map((chat) => {
          const lastMessage = chat.messages[0];
          const unreadCount = chat.messages.filter(
            (msg) => !msg.is_read && msg.sender_id !== 1 // ✅ Only count messages not sent by admin
          ).length;
          const isSelected = chat.id === selectedChatId;

          return (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`w-full text-left p-3 rounded-lg border transition flex justify-between items-center
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-100'}
              `}
            >
              <div className="flex-1">
                <p className={`font-semibold text-base ${isSelected ? 'text-blue-600' : 'text-primary'}`}>
                  {chat.sender.name}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {lastMessage?.message || 'No messages yet'}
                </p>
                {lastMessage && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(lastMessage.created_at).toLocaleString()}
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-3">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })
      ) : (
        <p className="text-gray-500">No active chats available.</p>
      )}
    </div>
  );
};

export default AdminChatDashboard;
