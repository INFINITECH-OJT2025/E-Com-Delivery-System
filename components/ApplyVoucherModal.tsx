"use client";
import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input } from "@heroui/react";
import { voucherService } from "@/services/voucherService";

interface VoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectVoucher: (voucher: any, type: string) => void;
    orderTotal: number;
}

export default function VoucherModal({ isOpen, onClose, onSelectVoucher, orderTotal }: VoucherModalProps) {
    const [vouchers, setVouchers] = useState([]);
    const [voucherCode, setVoucherCode] = useState("");
    const [appliedVouchers, setAppliedVouchers] = useState<Record<string, any>>({});
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchVouchers() {
            const response = await voucherService.getAvailableVouchers();
            if (response.success) {
                setVouchers(response.data);
            }
        }
        if (isOpen) {
            fetchVouchers();
            setError("");
        }
    }, [isOpen]);

    // ✅ Apply a manual voucher code
    const applyVoucherCode = async () => {
        setError("");
        const response = await voucherService.applyVoucher(voucherCode, orderTotal);
        
        if (!response.success) {
            setError(response.message || "Invalid voucher code.");
            return;
        }

        const voucher = response.data;
        const minOrder = parseFloat(voucher.minimum_order);

        if (orderTotal < minOrder) {
            setError(`Spend ₱${(minOrder - orderTotal).toFixed(2)} more to use this voucher.`);
            return;
        }

        // ✅ Apply voucher by type & send to CheckoutModal
        setAppliedVouchers((prev) => ({ ...prev, [voucher.type]: voucher }));
        onSelectVoucher(voucher, voucher.type);
        onClose();
    };

    // // ✅ Remove an applied voucher
    // const removeVoucher = (type: string) => {
    //     setAppliedVouchers((prev) => {
    //         const newVouchers = { ...prev };
    //         delete newVouchers[type];
    //         return newVouchers;
    //     });
    // };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="bottom" size="full" isDismissable={true}>
            <ModalContent className="rounded-none shadow-none">
                <ModalHeader className="flex items-center justify-between p-4 border-b shadow-sm bg-white">
                    <h2 className="text-lg font-bold">Vouchers & Offers</h2>
                </ModalHeader>

                <ModalBody className="p-4 h-[calc(100vh-100px)] overflow-y-auto bg-gray-50">
                    {/* 🎟️ Manual Voucher Code Entry */}
                    <div className="flex items-center gap-2 mb-4">
                        <Input
                            placeholder="Enter a voucher code"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            className="flex-1"
                        />
                        <Button onPress={applyVoucherCode} className="px-4 py-2" color="primary">Apply</Button>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* ✅ Applied Vouchers (Categorized) */}
                    {/* {Object.keys(appliedVouchers).length > 0 && (
                        <div className="space-y-2">
                            {Object.entries(appliedVouchers).map(([type, voucher]) => (
                                <div key={voucher.id} className="p-3 bg-green-100 text-green-700 rounded-md text-sm flex justify-between">
                                    <span>
                                        <strong>{voucher.code}</strong> - 
                                        {voucher.discount_percentage ? ` ${voucher.discount_percentage}% Off` : ` ₱${voucher.discount_amount} Off`}
                                    </span>
                                    <button className="text-red-500 text-xs" onClick={() => removeVoucher(type)}>
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    )} */}

                    {/* 🏷️ Available Vouchers List (Categorized) */}
                    <h3 className="font-bold text-gray-900 mt-4">Available Vouchers</h3>
                    <div className="space-y-4">
                        {["discount", "shipping", "reward"].map((category) => {
                            const categoryVouchers = vouchers.filter((v) => v.type === category);
                            if (categoryVouchers.length === 0) return null;

                            return (
                                <div key={category}>
                                    <h4 className="text-md font-semibold capitalize">{category} Vouchers</h4>
                                    {categoryVouchers.map((voucher) => {
                                        const minOrder = parseFloat(voucher.minimum_order);
                                        const isEligible = orderTotal >= minOrder;
                                        const remainingAmount = minOrder - orderTotal;
                                        const isSelected = appliedVouchers[voucher.type]?.id === voucher.id;

                                        return (
                                            <div
                                                key={voucher.id}
                                                className={`p-3 mt-2 border rounded-lg transition ${
                                                    isSelected
                                                        ? "border-primary bg-primary/10" // ✅ Highlight if selected
                                                        : isEligible && !voucher.used
                                                            ? "border-gray-300 cursor-pointer" // ✅ Selectable if eligible & not used
                                                            : "border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed" // ❌ Disable if not eligible or already used
                                                }`}
                                                
                                                onClick={() => {
                                                    if (isEligible && !voucher.used) { // ✅ Prevent selecting if already used
                                                        onSelectVoucher(voucher, category);
                                                        onClose();
                                                    }
                                                }}
                                            >
                                                <p className="font-semibold flex items-center">
                                                    {voucher.code} 
                                                    {voucher.used && <span className="ml-2 text-xs text-red-500">(Already Used)</span>} {/* ✅ Show if used */}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {voucher.discount_percentage 
                                                        ? `${voucher.discount_percentage}% Off`
                                                        : `₱${voucher.discount_amount} Off`}
                                                    • Min. spend ₱{voucher.minimum_order}
                                                </p>
                                                
                                                {/* 🚨 Show warning if not eligible */}
                                                {!isEligible && (
                                                    <p className="text-xs text-red-500">
                                                        Spend ₱{remainingAmount.toFixed(2)} more to use this.
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
