'use client';

import React, { useEffect, useState } from 'react';
import { fetchAdminChatMessages, sendSupportMessage } from '@/services/supportService';

const AdminChat = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const adminId = 1; // Replace with actual logged-in admin ID

  useEffect(() => {
    const loadMessages = async () => {
      const response = await fetchAdminChatMessages(chatId);
      if (response.success) {
        setMessages(response.messages);
      }
    };

    loadMessages();
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const response = await sendSupportMessage(chatId, messageInput);
    if (response.success) {
      setMessages([...messages, response.message]);
      setMessageInput('');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Chat with User</h2>
      <div className="h-96 overflow-y-auto border p-3 rounded-lg bg-gray-100">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 flex ${msg.sender_id === adminId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-2 rounded-lg shadow ${
                msg.sender_id === adminId ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
            >
              <p className="text-sm font-semibold">{msg.sender?.name}</p>
              <p>{msg.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow border p-2 rounded-l-lg"
        />
        <button onClick={handleSendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-r-lg">
          Send
        </button>
      </div>
    </div>
  );
};

export default AdminChat;
