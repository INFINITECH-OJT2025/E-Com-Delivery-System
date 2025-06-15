"use client";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

// ✅ Define Props for Different Modal Types
interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title?: string;
    message: string;
    type?: "warning" | "info" | "success" | "error"; // ✅ Added "error"
    confirmText?: string;
    cancelText?: string;
    hideCancel?: boolean;   // ✅ Optional hide cancel
    hideConfirm?: boolean;  // ✅ Optional hide confirm
}

export default function AlertModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Alert",
    message,
    type = "warning",
    confirmText = "OK",
    cancelText = "Cancel",
    hideCancel = false,
    hideConfirm = false,
}: AlertModalProps) {
    // ✅ Choose Icon Based on Type
    const icon = {
        warning: <AlertTriangle className="text-yellow-500 w-8 h-8" />,
        info: <Info className="text-blue-500 w-8 h-8" />,
        success: <CheckCircle className="text-green-500 w-8 h-8" />,
        error: <XCircle className="text-red-500 w-8 h-8" />,
    }[type];

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="center" size="sm">
            <ModalContent>
                {/* ✅ Modal Header */}
                <ModalHeader className="flex items-center gap-2 p-4">
                    {icon}
                    <span className="text-lg font-semibold">{title}</span>
                </ModalHeader>

                {/* ✅ Modal Body */}
                <ModalBody className="p-4 text-center">
                    <p className="text-gray-700">{message}</p>
                </ModalBody>

                {/* ✅ Modal Footer */}
                <ModalFooter className="p-4 flex justify-center gap-3">
                    {!hideCancel && (
                        <Button variant="light" className="px-6" onPress={onClose}>
                            {cancelText}
                        </Button>
                    )}

                    {!hideConfirm && onConfirm && (
                        <Button className="bg-primary text-white px-6" onPress={onConfirm}>
                            {confirmText}
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
