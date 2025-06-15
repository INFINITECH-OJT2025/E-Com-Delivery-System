"use client";
import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { IoPricetagOutline } from "react-icons/io5";

export default function VoucherModal({ isOpen, onClose }) {
    const [promos] = useState([
        { id: 1, code: "DISCOUNT10", discount_percentage: "10", minimum_order: "100", valid_until: "2025-04-01" },
        { id: 2, code: "SAVE50", discount_amount: "50", minimum_order: "500", valid_until: "2025-03-30" },
    ]);

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <ModalContent>
                <ModalHeader className="text-lg font-bold text-blue-700">My Vouchers</ModalHeader>
                <ModalBody className="space-y-3">
                    {promos.length > 0 ? (
                        promos.map((promo) => (
                            <div key={promo.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                                <h3 className="text-md font-bold">{promo.code}</h3>
                                {promo.discount_percentage ? (
                                    <p>{promo.discount_percentage}% Off</p>
                                ) : (
                                    <p>₱{promo.discount_amount} Off</p>
                                )}
                                <p className="text-xs text-gray-500">Minimum Order: ₱{promo.minimum_order}</p>
                                <p className="text-xs text-gray-500">Valid Until: {new Date(promo.valid_until).toLocaleString()}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500">No vouchers available.</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button onPress={onClose} className="w-full bg-blue-500 text-white">Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
