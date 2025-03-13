"use client";

import { useEffect, useState, useCallback } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { useOrderContext } from "@/context/orderContext";
import AlertModal from "@/components/AlertModal";
import RefundModal from "@/components/RefundModal";
import OrderDetails from "@/components/orders/OrderDetails";
import OrderCard from "@/components/orders/OrderCard";

export default function OrderModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { orders, fetchOrders } = useOrderContext();
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [alert, setAlert] = useState({ isOpen: false, title: "", message: "", onConfirm: undefined });
    const [refundOrder, setRefundOrder] = useState<any | null>(null);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

    /**
     * ✅ Fetch orders only when modal opens
     * ✅ Reset selectedOrder to null to ensure Order List (OrderCard) is shown first
     */
    useEffect(() => {
        if (isOpen) {
            fetchOrders();
            setSelectedOrder(null); // ✅ Always reset to Order List
        }
    }, [isOpen]);

    // ✅ Open Refund Modal
    const openRefundModal = useCallback((order: any) => {
        setRefundOrder(order);
        setIsRefundModalOpen(true);
    }, []);

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onClose} size="full" scrollBehavior="inside">
                <ModalContent className="max-w-md mx-auto rounded-lg">
                    <ModalHeader className="text-lg font-bold text-gray-800 border-b">Orders</ModalHeader>
                    <ModalBody className="space-y-4">
                        {orders.length === 0 ? (
                            <p className="text-center text-gray-500">No orders found.</p>
                        ) : selectedOrder ? (
                            <OrderDetails
                                order={selectedOrder} // ✅ Pass full order object
                                onBack={() => setSelectedOrder(null)}
                                openRefundModal={openRefundModal}
                                fetchOrders={fetchOrders}
                                openAlert={setAlert}
                            />
                        ) : (
                            // ✅ Show Order List (OrderCard) first
                            orders.map((order) => (
                                <OrderCard key={order.id} order={order} onOpen={() => setSelectedOrder(order)} />
                            ))
                        )}
                    </ModalBody>
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

            {/* ✅ Refund Modal */}
            {isRefundModalOpen && refundOrder && (
                <RefundModal
                    isOpen={isRefundModalOpen}
                    onClose={() => setIsRefundModalOpen(false)}
                    orderId={refundOrder.id}
                    fetchOrders={fetchOrders}
                    closeOrderModal={onClose} // ✅ Close OrderModal after refund
                />
            )}
        </>
    );
}
