'use client';

import React from 'react';
import AdminChatDashboard from '@/components/AdminChatDashboard';
import AdminChat from '@/components/AdminChat';
import { AdminChatProvider, useAdminChat } from '@/context/AdminChatContext';

const AdminChatLayout = () => {
  const { selectedChatId } = useAdminChat();

  return (
    <div className="h-[85vh] flex">

      {/* Sidebar */}
      <div className="w-1/3 h-full border-r bg-white p-4">
        <h2 className="text-xl font-semibold mb-4">📋 Active Chats</h2>
        <AdminChatDashboard />
      </div>

      {/* Main Chat */}
      <div className="w-2/3 flex flex-col h-full bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">💬 Support Chat</h2>
        </div>

        {selectedChatId ? (
          <AdminChat />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
            Select a chat to start messaging.
          </div>
        )}
      </div>
    </div>
  );
};

const AdminMessagesPage = () => (
  <AdminChatProvider>
    <AdminChatLayout />
  </AdminChatProvider>
);

export default AdminMessagesPage;
