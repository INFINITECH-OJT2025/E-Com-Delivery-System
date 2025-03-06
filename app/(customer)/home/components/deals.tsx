"use client";
import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { IoPricetagOutline } from "react-icons/io5";

interface Promo {
    id: number;
    code: string;
    discount_percentage?: string | null;
    discount_amount?: string | null;
    minimum_order: string;
    max_uses?: number;
    valid_until: string;
}

interface DealsProps {
    promos: Promo[];
}

export default function Deals({ promos }: DealsProps) {
    const [selectedDeal, setSelectedDeal] = useState<Promo | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openModal = (deal: Promo) => {
        setSelectedDeal(deal);
        setIsOpen(true);
    };

    return (
        <div className="flex gap-4 overflow-x-auto py-4">
            {promos.map((deal) => {
                const discountLabel = deal.discount_percentage
                    ? `${deal.discount_percentage}% off`
                    : deal.discount_amount
                    ? `₱${deal.discount_amount} off`
                    : "Special Offer";

                return (
                    <button
                        key={deal.id}
                        className="relative bg-gradient-to-b from-blue-400 to-blue-500 text-white p-5 rounded-xl min-w-[200px] text-left shadow-lg border border-blue-600 hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
                        onClick={() => openModal(deal)}
                    >
                        {/* Inner Glow Effect */}
                        <div className="absolute inset-0 bg-white/10 rounded-xl shadow-inner pointer-events-none"></div>

                        {/* Content */}
                        <div className="flex items-center gap-2">
                            <IoPricetagOutline className="text-2xl text-white drop-shadow-md" />
                            <span className="font-bold text-lg drop-shadow-md">{discountLabel}</span>
                        </div>
                        <p className="text-sm mt-1 text-white/90 drop-shadow-sm">
                            Use code: <strong>{deal.code}</strong>
                        </p>
                    </button>
                );
            })}

            {/* Deal Details Modal */}
            {selectedDeal && (
                <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
                    <ModalContent>
                        <ModalHeader className="text-lg font-bold text-blue-700">
                            {selectedDeal.discount_percentage
                                ? `${selectedDeal.discount_percentage}% Off`
                                : selectedDeal.discount_amount
                                ? `₱${selectedDeal.discount_amount} Off`
                                : "Special Offer"}{" "}
                            - {selectedDeal.code}
                        </ModalHeader>

                        <ModalBody>
                            {selectedDeal.discount_percentage && (
                                <p>
                                    <strong>Discount:</strong> {selectedDeal.discount_percentage}%
                                </p>
                            )}
                            {selectedDeal.discount_amount && (
                                <p>
                                    <strong>Amount Off:</strong> ₱{selectedDeal.discount_amount}
                                </p>
                            )}
                            <p>
                                <strong>Minimum Order:</strong> ₱{selectedDeal.minimum_order}
                            </p>
                            {selectedDeal.max_uses !== undefined && (
                                <p>
                                    <strong>Max Uses:</strong> {selectedDeal.max_uses} times
                                </p>
                            )}
                            <p>
                                <strong>Valid Until:</strong> {new Date(selectedDeal.valid_until).toLocaleString()}
                            </p>
                        </ModalBody>

                        <ModalFooter>
                            <Button onClick={() => setIsOpen(false)} className="w-full bg-blue-500 text-white">
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </div>
    );
}
