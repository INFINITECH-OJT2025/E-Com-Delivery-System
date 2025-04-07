'use client';

import React, { useEffect, useState } from 'react';
import ChatBot, { ChatBotProvider } from 'react-chatbotify';
import { submitSupportTicket, fetchUserTickets } from '@/services/supportService';
import OpenAdminChat from './OpenAdminChat';

const RiderChatSupportBot = () => {
  const [ticketSubject, setTicketSubject] = useState<string | null>(null);
  const [ticketMessage, setTicketMessage] = useState<string | null>(null);
  const [tickets, setTickets] = useState<{ id: number; subject: string; status: string }[]>([]);

  useEffect(() => {
    const loadTickets = async () => {
      const response = await fetchUserTickets();
      if (response.success) {
        setTickets(response.tickets);
      }
    };
    loadTickets();
  }, []);

  const settings = {
    header: {
      title: "RiderBot Support",
      showAvatar: true,
      avatar: "/images/delivery-panda.png",
    },
    general: {
      primaryColor: "#2563eb",
      secondaryColor: "#1e40af",
      showHeader: true,
    },
  };

  const handleTicketSubmit = async () => {
    if (!ticketSubject || !ticketMessage) return "error";

    const response = await submitSupportTicket(ticketSubject, ticketMessage);
    if (response.success) {
      setTickets([...tickets, response.ticket]);
      setTicketSubject(null);
      setTicketMessage(null);
      return "ticket_submitted";
    }
    return "error";
  };

  const flow = {
    start: {
      message: "👋 Hi Rider! How can I help you today?",
      options: ["🛵 Delivery Issues", "🧾 Payment Questions", "📨 Submit a Ticket", "💬 Chat with Admin"],
      path: ({ userInput }: { userInput: string }) => {
        switch (userInput) {
          case "🛵 Delivery Issues": return "delivery_faqs";
          case "🧾 Payment Questions": return "payment_faqs";
          case "📨 Submit a Ticket": return "ticket_subject";
          case "💬 Chat with Admin": return "chat_with_admin";
          default: return "start";
        }
      },
    },
    delivery_faqs: {
      message: "🚚 Delivery Help Topics",
      options: [
        "📍 How do I update my location?",
        "❌ What if a customer cancels?",
        "Main menu",
      ],
      path: ({ userInput }: { userInput: string }) => {
        const map: Record<string, string> = {
          "📍 How do I update my location?": "faq_location",
          "❌ What if a customer cancels?": "faq_cancellation",
          "Main menu": "start",
        };
        return map[userInput];
      },
    },
    payment_faqs: {
      message: "💵 Payment & Earnings Help",
      options: [
        "💰 When will I receive my payout?",
        "🔁 How do I check my earnings?",
        "Main menu",
      ],
      path: ({ userInput }: { userInput: string }) => {
        const map: Record<string, string> = {
          "💰 When will I receive my payout?": "faq_payout",
          "🔁 How do I check my earnings?": "faq_earnings",
          "Main menu": "start",
        };
        return map[userInput];
      },
    },
    faq_location: {
      message: "📍 You can update your location in the dashboard via the 'Set Location' button at the top.",
      options: ["Back", "Main menu"],
      path: ({ userInput }: { userInput: string }) => (userInput === "Back" ? "delivery_faqs" : "start"),
    },
    faq_cancellation: {
      message: "❌ If a customer cancels, the order will be removed from your list. You can return to the hub or wait for a new assignment.",
      options: ["Back", "Main menu"],
      path: ({ userInput }: { userInput: string }) => (userInput === "Back" ? "delivery_faqs" : "start"),
    },
    faq_payout: {
      message: "💰 Payouts are processed weekly every Monday. Check the 'Payout' tab for details.",
      options: ["Back", "Main menu"],
      path: ({ userInput }: { userInput: string }) => (userInput === "Back" ? "payment_faqs" : "start"),
    },
    faq_earnings: {
      message: "🔁 Your total earnings are shown on your dashboard in the 'Earnings Card' section.",
      options: ["Back", "Main menu"],
      path: ({ userInput }: { userInput: string }) => (userInput === "Back" ? "payment_faqs" : "start"),
    },
    ticket_subject: {
      message: "📝 Enter the subject of your support request.",
      inputType: "text",
      path: ({ userInput }: { userInput: string }) => {
        setTicketSubject(userInput);
        return "ticket_message";
      },
    },
    ticket_message: {
      message: "📩 Please describe the issue.",
      inputType: "textarea",
      path: ({ userInput }: { userInput: string }) => {
        setTicketMessage(userInput);
        return "ticket_confirm";
      },
    },
    ticket_confirm: {
      message: "✅ Ready to submit?",
      options: ["Yes", "No"],
      path: async ({ userInput }: { userInput: string }) =>
        userInput === "Yes" ? await handleTicketSubmit() : "start",
    },
    ticket_submitted: {
      message: "🎉 Ticket submitted! Support will contact you shortly.",
      options: ["Main menu"],
      path: "start",
    },
    chat_with_admin: {
      component: <OpenAdminChat />,
      options: ["Main menu"],
      path: "start",
    },
    error: {
      message: "⚠️ Something went wrong. Please try again later.",
      options: ["Main menu"],
      path: "start",
    },
  };

  return (
    <ChatBotProvider>
      <ChatBot id="rider-support" flow={flow} settings={settings} />
    </ChatBotProvider>
  );
};

export default RiderChatSupportBot;
