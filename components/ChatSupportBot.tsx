'use client';

import React, { useEffect, useState } from 'react';
import ChatBot, { ChatBotProvider } from 'react-chatbotify';
import { submitSupportTicket, fetchUserTickets } from '@/services/supportService';
import PendingOrder from './chatbot/PendingOrder';
import OpenAdminChat from './chatbot/OpenAdminChat';

const ChatSupportBot = () => {
  const [ticketSubject, setTicketSubject] = useState<string | null>(null);
  const [ticketMessage, setTicketMessage] = useState<string | null>(null);
  const [tickets, setTickets] = useState<{ id: number; subject: string; status: string }[]>([]);

  useEffect(() => {
    const loadUserTickets = async () => {
      const response = await fetchUserTickets();
      if (response.success) {
        setTickets(response.tickets);
      }
    };

    loadUserTickets();
  }, []);

  const handleTicketSubmission = async () => {
    if (!ticketSubject || !ticketMessage) return "error"; // Ensure both fields are filled

    const response = await submitSupportTicket(ticketSubject, ticketMessage);
    if (response.success) {
      setTickets([...tickets, response.ticket]);
      setTicketSubject(null); // Clear after submission
      setTicketMessage(null);
      return "ticket_submitted";
    }
    return "error";
  };

  const flow = {
    start: {
      message: "👋 Hi there! How can I assist you today?",
      options: ["Check Pending Order", "FAQs", "Submit a Support Ticket","💬 Chat with Admin"],
      chatDisabled: false,
      path: ({ userInput }: { userInput: string }) => {
        switch (userInput) {
          case "Check Pending Order":
            return "pending_order";
          case "FAQs":
            return "faqs";
          case "Submit a Support Ticket":
            return "submit_ticket_subject";
          case "💬 Chat with Admin":
            return "chat_with_admin";
          default:
            return "start";
        }
      },
    },
    pending_order: {
      component: <PendingOrder />,
      options: ["Main menu", "Submit a Support Ticket"],
      chatDisabled: false,
      path: ({ userInput }: { userInput: string }) =>
        userInput === "Submit a Support Ticket" ? "submit_ticket_subject" : "start",
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
      options: ["Main menu", "Submit a Support Ticket"],
      chatDisabled: false,
      path: ({ userInput }: { userInput: string }) =>
        userInput === "Submit a Support Ticket" ? "submit_ticket_subject" : "faqs",
    },
    submit_ticket_subject: {
      message: "📝 Please enter the subject of your support ticket.",
      inputType: "text",
      chatDisabled: false,
      path: ({ userInput }: { userInput: string }) => {
        setTicketSubject(userInput); // ✅ Store ticket subject
        return "submit_ticket_message";
      },
    },
    submit_ticket_message: {
      message: "📩 Now, please describe your issue in detail.",
      inputType: "textarea",
      chatDisabled: false,
      path: ({ userInput }: { userInput: string }) => {
        setTicketMessage(userInput); // ✅ Store ticket message
        return "confirm_ticket";
      },
    },
    confirm_ticket: {
      message: "✅ Do you want to submit this ticket?",
      options: ["Yes", "No"],
      chatDisabled: false,
      path: async ({ userInput }: { userInput: string }) => {
        if (userInput === "Yes") {
          return await handleTicketSubmission();
        }
        return "start";
      },
    },
    ticket_submitted: {
      message: "🎉 Your support ticket has been submitted! You will receive updates via email.",
      options: ["View My Tickets", "Main Menu"],
      chatDisabled: false,
      path: ({ userInput }: { userInput: string }) => (userInput === "View My Tickets" ? "view_tickets" : "start"),
    },
    view_tickets: {
      component: (
        <div>
          <h3 className="font-bold">📌 Your Support Tickets:</h3>
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div key={ticket.id} className="p-2 border-b">
                <p><strong>Subject:</strong> {ticket.subject}</p>
                <p><strong>Status:</strong> {ticket.status}</p>
              </div>
            ))
          ) : (
            <p>No tickets found.</p>
          )}
        </div>
      ),
      options: ["Main Menu"],
      chatDisabled: false,
      path: "start",
    },
    chat_with_admin: {
      component: <OpenAdminChat />,
      options: ["Main menu"],
      chatDisabled: false,
      path: "start",
    },
    
    error: {
      message: "⚠️ Something went wrong. Please try again later.",
      options: ["Main menu"],
      chatDisabled: false,
      path: "start",
    },
  };

  return (
    <ChatBotProvider>
      <ChatBot id="ecom-support" flow={flow} />
    </ChatBotProvider>
  );
};

export default ChatSupportBot;
