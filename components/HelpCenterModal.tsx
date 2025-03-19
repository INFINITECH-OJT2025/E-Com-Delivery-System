"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Accordion, AccordionItem } from "@heroui/react";
import { HelpCircle, Phone, MessageCircle, Send, Mail } from "lucide-react";

interface HelpCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HelpCenterModal({ isOpen, onClose }: HelpCenterModalProps) {
    const [message, setMessage] = useState("");

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="full">
            <ModalContent className="rounded-lg">
                <ModalHeader className="text-lg font-bold flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-primary" /> Help Center
                </ModalHeader>
                <ModalBody className="space-y-4">
                    {/* ✅ FAQ Section with Accordion */}
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

                    {/* ✅ Contact Options */}
                    <div className="space-y-3">
                        <h3 className="text-md font-semibold">Need further assistance?</h3>
                        <div className="flex flex-col space-y-2">
                            <Button variant="light" className="flex items-center gap-2">
                                <Phone className="w-5 h-5 text-green-600" /> Call Customer Support
                            </Button>
                            <Button variant="light" className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-blue-600" /> Send an Email
                            </Button>
                            <Button variant="light" className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-purple-600" /> Live Chat Support
                            </Button>
                        </div>
                    </div>

                    {/* ✅ Send a Message */}
                    <div>
                        <h3 className="text-md font-semibold">Send Us a Message</h3>
                        <Textarea
                            placeholder="Describe your issue..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                </ModalBody>
                <ModalFooter className="flex justify-between">
                    <Button variant="bordered" onPress={onClose}>
                        Close
                    </Button>
                    <Button color="primary" disabled={!message} onPress={() => alert("Message Sent!")}>
                        <Send className="w-5 h-5 mr-2" /> Send
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
