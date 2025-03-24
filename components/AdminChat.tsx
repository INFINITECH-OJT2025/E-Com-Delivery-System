'use client';

import React, { useEffect, useRef, useState } from 'react';
import { fetchMessages, sendAdminMessage } from '@/services/chatService';
import { useAdminChat } from '@/context/AdminChatContext';
import { UserCircle, ShieldCheck, ArrowDownCircle } from 'lucide-react';

const POLLING_INTERVAL = 5000;

const AdminChat = () => {
  const { selectedChatId, refreshChats } = useAdminChat();
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isNearBottom = () => {
    const container = containerRef.current;
    if (!container) return true;
    return container.scrollHeight - container.scrollTop - container.clientHeight < 100;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  useEffect(() => {
    if (!selectedChatId) return;

    const loadMessages = async () => {
      const response = await fetchMessages(selectedChatId);
      if (response.success) {
        setMessages(response.messages);
        if (isNearBottom()) {
          scrollToBottom();
        } else {
          setShowScrollButton(true);
        }
      }
    };

    loadMessages();

    const interval = setInterval(loadMessages, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [selectedChatId]);

  const handleSendMessage = async () => {
    if (!selectedChatId || !messageInput.trim()) return;

    const response = await sendAdminMessage(selectedChatId, messageInput.trim());
    if (response.success) {
      const newMsg = {
        sender_id: 1,
        message: messageInput.trim(),
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setMessageInput('');
      await refreshChats();

      if (isNearBottom()) {
        scrollToBottom();
      } else {
        setShowScrollButton(true);
      }
    }
  };

  const renderMessage = (msg: any, index: number) => {
    const isAdmin = msg.sender_id === 1;
    const time = new Date(msg.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div key={index} className={`flex items-end gap-2 mb-3 ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          {isAdmin ? <ShieldCheck size={16} /> : <UserCircle size={16} />}
        </div>

        <div
          className={`max-w-[75%] p-3 rounded-xl text-sm shadow ${
            isAdmin
              ? 'bg-blue-600 text-white rounded-bl-none'
              : 'bg-green-500 text-white rounded-br-none'
          }`}
        >
          <p>{msg.message}</p>
          <div className="text-xs text-right text-gray-200 mt-1">{time}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col h-full max-h-[80vh] border rounded-xl shadow-lg">
      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={() => setShowScrollButton(!isNearBottom())}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-t-xl"
      >
        {messages.length > 0 ? (
          messages.map((msg, index) => renderMessage(msg, index))
        ) : (
          <p className="text-gray-500 text-center mt-10">No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24  bg-white border shadow-md rounded-full p-2 hover:bg-gray-100 transition left-1/2"
        >
          <ArrowDownCircle className="text-primary" size={24} />
        </button>
      )}

      {/* Input */}
      <div className="sticky bottom-0 bg-white p-4 border-t flex gap-2 rounded-b-xl shadow-md">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-primary"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition text-sm shadow"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AdminChat;
