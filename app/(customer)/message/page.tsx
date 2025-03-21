'use client';

import React, { useEffect, useState, useRef } from 'react';
import { chatService } from '@/services/chatService';
import { Input, Button, Spinner, Avatar } from '@heroui/react';
import { Send, ArrowDown } from 'lucide-react';
import { useUser } from '@/context/userContext';

const SCROLL_THRESHOLD = 150; // px from bottom to auto-scroll

const MessagePage = () => {
  const [chatId, setChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  useEffect(() => {
    const initChat = async () => {
      try {
        const chatResponse = await chatService.startChat();
        if (chatResponse.success) {
          setChatId(chatResponse.chat_id);
          await loadMessages(chatResponse.chat_id);
        }
      } catch (error) {
        console.error('Chat initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, []);

  useEffect(() => {
    if (!chatId) return;

    const poll = setInterval(() => {
      loadMessages(chatId, true);
    }, 5000);

    return () => clearInterval(poll);
  }, [chatId]);

  const loadMessages = async (chatId: number, isPolling = false) => {
    const msgResponse = await chatService.fetchMessages(chatId);
    if (msgResponse.success) {
      const isNearBottom = checkIfNearBottom();
      setMessages(msgResponse.messages);
      if (!isPolling || isNearBottom) {
        scrollToBottom();
      } else {
        setShowScrollButton(true);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatId || !messageInput.trim()) return;

    const sendResponse = await chatService.sendMessage(chatId, messageInput.trim());
    if (sendResponse.success) {
      setMessages((prev) => [...prev, sendResponse.message]);
      setMessageInput('');
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  const checkIfNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
  };

  const handleScroll = () => {
    const isNearBottom = checkIfNearBottom();
    setShowScrollButton(!isNearBottom);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen relative">
      <header className="bg-primary text-white py-4 px-6 shadow-md">
        <h1 className="text-3xl font-semibold">💬 Chat with Admin</h1>
      </header>

      <main
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto px-4 py-6 bg-gray-50 space-y-4"
      >
        {messages.map((msg) => {
          const isSelf = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${isSelf ? 'justify-end' : 'justify-start'}`}
            >
              {!isSelf && (
                <Avatar
                  size="sm"
                  name={msg.sender?.name || 'User'}
                  src={msg.sender?.profile_image || ''}
                />
              )}
              <div
                className={`max-w-xs md:max-w-md rounded-lg p-3 text-sm ${
                  isSelf ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <div className="text-xs mt-1 text-right opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {isSelf && (
                <Avatar
                  size="sm"
                  name={user.name}
                  src={user.profile_image || ''}
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* ⬇️ Scroll-to-bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/90 transition"
          title="Scroll to latest message"
        >
          <ArrowDown size={20} />
        </button>
      )}

      <footer className="p-4 bg-white flex gap-2 border-t shadow-inner">
        <Input
          placeholder="Type your message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          fullWidth
          className="text-base"
        />
        <Button color="primary" onPress={handleSendMessage}>
          <Send size={18} />
        </Button>
      </footer>
    </div>
  );
};

export default MessagePage;
