"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { HelpCircle, Mail } from "lucide-react";
import ChatSupportBot from "@/components/ChatSupportBot"; // ✅ Always visible here

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpCenterModal({ isOpen, onClose }: HelpCenterModalProps) {
  const handleEmailClick = () => {
    const email = "support@ecom.com"; // ✅ Replace with your real support email
    const subject = encodeURIComponent("Support Inquiry");
    const body = encodeURIComponent("Hi E-Com Delivery Support,\n\nI need help with...");
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="full">
      <ModalContent className="rounded-lg">
        <ModalHeader className="text-lg font-bold flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" /> Help Center
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* ✅ FAQ Section */}
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="text-md font-semibold mb-2">Frequently Asked Questions</h3>
            <Accordion isCompact>
              <AccordionItem key="1" aria-label="FAQ 1" title="📦 How do I track my order?">
                You can track your order via the "My Orders" section in your profile. You will also receive a tracking link once your order is out for delivery.
              </AccordionItem>
              <AccordionItem key="2" aria-label="FAQ 2" title="💳 How can I request a refund?">
                Refunds can be requested from your order details page. If your order qualifies for a refund, follow the steps provided to submit your request.
              </AccordionItem>
              <AccordionItem key="3" aria-label="FAQ 3" title="🚴 Where is my delivery rider?">
                You can check your rider's real-time location via the order tracking page. If you are experiencing delays, feel free to contact support.
              </AccordionItem>
              <AccordionItem key="4" aria-label="FAQ 4" title="📅 Can I schedule an order?">
                Yes! When placing an order, select the "Schedule" option and choose your preferred date and time.
              </AccordionItem>
            </Accordion>
          </div>

          {/* ✅ Contact Support */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold">Still need help?</h3>
            <Button
              variant="light"
              onPress={handleEmailClick}
              className="flex items-center gap-2"
            >
              <Mail className="w-5 h-5 text-blue-600" /> Send an Email
            </Button>
          </div>

          {/* ✅ Chatbot Always Visible */}
          <ChatSupportBot />
          
        </ModalBody>

        <ModalFooter>
          <Button variant="bordered" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    
    </Modal>
  );
}
