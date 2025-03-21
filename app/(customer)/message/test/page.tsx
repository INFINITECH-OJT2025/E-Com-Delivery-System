"use client";

import React, { useState } from "react";
import { Input, Button, Spinner } from "@heroui/react";
import { chatService } from "@/services/chatService";

export default function MessagePage() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const res = await chatService.testSend(message.trim());
    setLoading(false);
    if (res.success) {
      setStatus("Message sent, waiting for broadcast...");
      setMessage("");
    } else {
      setStatus("Error sending message");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Send Message to Laravel</h1>
      <div className="flex flex-col gap-3 max-w-md">
        <Input
          placeholder="Enter your message"
          value={message}
          onValueChange={(val) => setMessage(val)}
        />
        <Button color="primary" onPress={sendMessage}>
          {loading ? <Spinner size="sm" /> : "Send Message"}
        </Button>
        {status && <p>{status}</p>}
      </div>
      <p className="mt-4">
        After sending, check your Pusher Dashboard or your frontend subscription (e.g., your MessagePage with Pusher subscription) to see if the event is received.
      </p>
    </div>
  );
}
