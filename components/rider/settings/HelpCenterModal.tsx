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
import { HelpCircle, Mail, X } from "lucide-react";
import ChatSupportBot from "@/components/rider/chatbot/RiderChatSupportBot"; // ✅ Reuse your chatbot here

export default function HelpCenterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const handleEmailClick = () => {
    const email = "support@ecomrider.com";
    const subject = encodeURIComponent("Rider Support Request");
    const body = encodeURIComponent("Hi E-Com Rider Support,\n\nI need help with...");
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="full" hideCloseButton={true}>
      <ModalContent className="rounded-lg">
        <ModalHeader className=" text-lg font-bold flex items-center gap-2 bg-primary text-white">
          <HelpCircle className="w-6 h-6 text-white" />  <h3 className="text-base font-semibold">Rider Help Center</h3>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:opacity-80"
          >
            <X size={18} />
          </button>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* 🚴 FAQ Section */}
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="text-md font-semibold mb-2">Frequently Asked Questions</h3>
            <Accordion isCompact>
              <AccordionItem key="1" title="📍 How do I update my delivery location?">
                Go to your dashboard and use the location picker to update your current area.
              </AccordionItem>
              <AccordionItem key="2" title="📄 Where do I upload my license?">
                Visit Settings → Upload Documents. Make sure it's clear and under 2MB.
              </AccordionItem>
              <AccordionItem key="3" title="📦 Can I reject an assigned order?">
                Assigned orders are expected to be completed. If there’s an issue, please contact support.
              </AccordionItem>
              <AccordionItem key="4" title="💰 How do I view my earnings?">
                Your earnings summary is on the Dashboard and Payout sections.
              </AccordionItem>
            </Accordion>
          </div>

          {/* 🆘 Contact Support */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold">Still need help?</h3>
            <Button
              variant="light"
              onPress={handleEmailClick}
              className="flex items-center gap-2"
            >
              <Mail className="w-5 h-5 text-blue-600" /> Send Email to Support
            </Button>
          </div>

          {/* 🤖 Rider Chatbot */}
          <ChatSupportBot />
        </ModalBody>

        <ModalFooter>
         
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
