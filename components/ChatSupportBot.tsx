'use client';

import React, { useEffect, useState } from 'react';
import ChatBot, { ChatBotProvider, Button } from 'react-chatbotify';
import { fetchChatMessages, sendChatMessage } from '@/services/supportService';
import PendingOrder from './chatbot/PendingOrder';

const ChatSupportBot = () => {
  const [messages, setMessages] = useState<{ sender_id: number; message: string }[]>([]);

  useEffect(() => {
    const loadMessages = async () => {
      const response = await fetchChatMessages();
      if (response.success) {
        setMessages(response.messages);
      }
    };

    loadMessages();
  }, []);

  const handleSendMessage = async (userInput: string) => {
    const response = await sendChatMessage(userInput);
    if (response.success) {
      setMessages([...messages, response.message]);
    }
  };

  const flow = {
    start: {
      message: "👋 Hi there! How can I help you today?",
      options: ["Check Pending Order", "FAQs", "Talk to Agent"],
      chatDisabled: false,
      path: ({ userInput }: { userInput: string }) => {
        switch (userInput) {
          case "Check Pending Order":
            return "pending_order"; // ✅ Fetch pending order automatically
          case "FAQs":
            return "faqs";
          case "Talk to Agent":
            return "chat"; // ✅ Now opens real-time chat
          default:
            return "start";
        }
      },
    },
    pending_order: {
      component: <PendingOrder />,
      options: ["Main menu", "Talk to Agent"],
      chatDisabled: false,
      path: ({ userInput }: { userInput: string }) =>
        userInput === "Talk to Agent" ? "chat" : "start",
    },
    faqs: {
      message: "📖 Frequently Asked Questions (FAQs)",
      options: [
        "📦 How do I track my order?",
        "💳 How can I request a refund?",
        "🚴 Where is my delivery rider?",
        "📅 Can I schedule an order?",
        "Main menu",
      ],
      chatDisabled: false,
      path: ({ userInput }: { userInput: string }) => {
        if (userInput === "Main menu") return "start";
        return "faq_answer";
      },
    },
    faq_answer: {
      message: ({ userInput }: { userInput: string }) => {
        const answers: Record<string, string> = {
          "📦 How do I track my order?":
            'Track your order in the "My Orders" section. You will also receive a tracking link once your order is out for delivery.',
          "💳 How can I request a refund?":
            "Refund requests can be submitted from your order details page within 24 hours of receiving your order.",
          "🚴 Where is my delivery rider?":
            "You can view your rider’s real-time location on your order tracking page.",
          "📅 Can I schedule an order?":
            "Yes! Simply select 'Schedule' at checkout and pick your preferred delivery date and time.",
        };
        return answers[userInput] || "Sorry, I didn't understand that.";
      },
      options: ["Main menu", "Talk to Agent"],
      chatDisabled: false,
      path: ({ userInput }: { userInput: string }) =>
        userInput === "Talk to Agent" ? "chat" : "faqs",
    },
    chat: {
      component: (
        <div>
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender_id === 1 ? "text-left" : "text-right"}>
              <p className="bg-gray-200 p-2 rounded">{msg.message}</p>
            </div>
          ))}
        </div>
      ),
      chatDisabled: false,
      path: "send_message",
    },
    send_message: {
      function: async ({ userInput }: { userInput: string }) => {
        await handleSendMessage(userInput);
        return "chat"; // ✅ Keeps chat open
      },
    },
  };

  return (
    <ChatBotProvider>
      <ChatBot id="ecom-support" flow={flow} />
    </ChatBotProvider>
  );
};

export default ChatSupportBot;
