"use client";

import { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@heroui/react";
import { FileImage, RotateCw, X, Trash2 } from "lucide-react";
import { refundService } from "@/services/refundService";
import AlertModal from "@/components/AlertModal";

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId?: number;
    totalAmount?: number;
    fetchOrders: () => void;
    closeOrderModal: () => void; // ✅ Close OrderModal as well
}

export default function RefundModal({ isOpen, onClose, orderId, totalAmount = 0, fetchOrders, closeOrderModal }: RefundModalProps) {
    const [reason, setReason] = useState("");
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ isOpen: boolean; title: string; message: string; onConfirm?: () => void }>({
        isOpen: false,
        title: "",
        message: "",
    });

    /**
     * ✅ Handle File Upload
     */
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setProofImage(event.target.files[0]);
        }
    };

    /**
     * ✅ Remove Uploaded Image
     */
    const removeImage = () => {
        setProofImage(null);
    };

    /**
     * ✅ Submit Refund Request & Close All Modals
     */
    const handleSubmitRefund = async () => {
        const finalReason = reason.trim();

        if (!orderId) {
            setAlert({ isOpen: true, title: "Error", message: "Order ID is missing. Please try again." });
            return;
        }

        if (!finalReason) {
            setAlert({ isOpen: true, title: "Error", message: "Please provide a refund reason." });
            return;
        }

        if (!proofImage) {
            setAlert({ isOpen: true, title: "Error", message: "Please upload a proof image." });
            return;
        }

        setLoading(true);

        try {
            const response = await refundService.requestRefund(orderId, totalAmount, finalReason, proofImage);

            if (response.success) {
                setAlert({
                    isOpen: true,
                    title: "Success",
                    message: "Refund request submitted successfully!",
                    onConfirm: async () => {
                        await fetchOrders();
                        setTimeout(() => {
                            setAlert({ isOpen: false, title: "", message: "" });
                            onClose(); // ✅ Close Refund Modal
                            closeOrderModal(); // ✅ Close Order Modal
                        }, 500);
                    },
                });

                setReason("");
                setProofImage(null);
            } else {
                setAlert({ isOpen: true, title: "Error", message: response.message });
            }
        } catch (error) {
            setAlert({ isOpen: true, title: "Error", message: "Something went wrong. Please try again later." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onClose} placement="center" size="sm">
                <ModalContent>
                    <ModalHeader className="text-lg font-semibold text-gray-800 border-b">Request Refund</ModalHeader>

                    <ModalBody className="space-y-4">
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter refund reason..."
                            className="w-full"
                            rows={3}
                        />

                        <div className="flex flex-col items-center justify-center border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="proof-upload" />
                            <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center">
                                {proofImage ? (
                                    <>
                                        <img src={URL.createObjectURL(proofImage)} alt="Proof" className="h-24 object-cover rounded-md" />
                                        <Button
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                                            onPress={removeImage}
                                            size="sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <FileImage className="w-8 h-8 text-gray-500 mb-2" />
                                        <p className="text-sm text-gray-600">Upload proof (image)</p>
                                    </>
                                )}
                            </label>
                        </div>
                    </ModalBody>

                    <ModalFooter className="flex justify-between">
                        <Button variant="bordered" onPress={onClose} className="px-6">
                            <X className="w-5 h-5 mr-2" />
                            Cancel
                        </Button>
                        <Button className="bg-yellow-500 text-white px-6" onPress={handleSubmitRefund} isLoading={loading}>
                            <RotateCw className="w-5 h-5 mr-2" />
                            Submit Refund
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* ✅ Alert Modal */}
            <AlertModal
                isOpen={alert.isOpen}
                onClose={() => setAlert({ ...alert, isOpen: false })}
                title={alert.title}
                message={alert.message}
                onConfirm={alert.onConfirm}
            />
        </>
    );
}
