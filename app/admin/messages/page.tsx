'use client';

import React, { useEffect, useState } from 'react';
import AdminChatDashboard from '@/components/AdminChatDashboard';
import AdminChat from '@/components/AdminChat';

const AdminMessagesPage = () => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Support Messages</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Sidebar: List of Active Chats */}
        <div className="col-span-1 border p-4 rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-3">Active Chats</h2>
          <AdminChatDashboard onSelectChat={setSelectedChatId} />
        </div>

        {/* Chat Window: Admin Replies */}
        <div className="col-span-2 border p-4 rounded-lg bg-white shadow">
          {selectedChatId ? (
            <AdminChat chatId={selectedChatId} />
          ) : (
            <p className="text-gray-500">Select a chat to start messaging.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;
