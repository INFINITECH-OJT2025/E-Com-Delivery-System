"use client";
import { useEffect, useState } from "react";
import { Button, Input, Textarea, Checkbox } from "@heroui/react";
import { MapPin, Edit, ArrowLeft, CreditCard, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { addressService } from "@/services/addressService";
import { checkoutService } from "@/services/checkoutService";
import { useCart } from "@/context/cartContext";
import AlertModal from "@/components/AlertModal";
import VoucherModal from "@/components/ApplyVoucherModal"; // ✅ Import voucher modal

export default function CheckoutPage() {
    const router = useRouter();
    const { cart } = useCart(); // ✅ Use cart context

    // 🔥 State Management
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [contactlessDelivery, setContactlessDelivery] = useState(true);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    // 🏷️ Voucher State
    const [isVoucherModalOpen, setVoucherModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    // ✅ Fetch User & Addresses on Load
    useEffect(() => {
        fetchUser();
        fetchAddresses();
    }, []);

    const fetchUser = async () => {
        const response = await userService.fetchUser();
        if (response.success) {
            setUser(response.data);
            checkMissingInfo(response.data);
        }
    };

    const fetchAddresses = async () => {
        const response = await addressService.fetchAddresses();
        if (response.success) {
            setAddresses(response.data);
            setSelectedAddress(response.data.find(addr => addr.is_default) || response.data[0]);
        }
    };

    const checkMissingInfo = (user) => {
        if (!user?.name || !user?.phone_number) {
            setAlertMessage("Please complete your profile (Name & Phone) before placing an order.");
            setIsAlertOpen(true);
        }
    };

    // ✅ Handle Checkout (Ensure Address is Selected & Voucher Applied)
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            setAlertMessage("Please select a delivery address.");
            setIsAlertOpen(true);
            return;
        }

        const response = await checkoutService.placeOrder({
            address_id: selectedAddress.id,
            voucher_code: selectedVoucher?.code || null, // ✅ Include voucher if selected
        });

        if (!response.success) {
            setAlertMessage(response.message || "Failed to place order.");
            setIsAlertOpen(true);
            return;
        }

        router.push("/order-confirmation");
    };

    return (
        <div className="max-w-lg mx-auto p-4">
            {/* 🔙 Back Button */}
            <button onClick={() => router.back()} className="flex items-center text-gray-700 mb-4">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>

            {/* 🚚 Delivery Address Section */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>

                {selectedAddress && (
                    <div className="flex items-center mt-3">
                        <MapPin className="text-primary w-5 h-5 mr-2" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{selectedAddress.address}</p>
                            <p className="text-xs text-gray-500">{selectedAddress.label}</p>
                        </div>
                        <button className="text-primary text-sm flex items-center">
                            <Edit className="w-4 h-4 mr-1" /> Edit
                        </button>
                    </div>
                )}
            </div>

            {/* 🛍️ Order Summary */}
            <div className="bg-white p-4 rounded-lg shadow-md mt-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>

                <div className="mt-3 space-y-2">
                    {cart?.cart_items?.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.menu.name} x {item.quantity}</span>
                            <span>₱{item.subtotal}</span>
                        </div>
                    ))}

                    {/* 🏷️ Apply Voucher Section */}
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Apply Voucher</span>
                        <button
                            onClick={() => setVoucherModalOpen(true)}
                            className="flex items-center text-primary text-sm"
                        >
                            <Ticket className="w-4 h-4 mr-1" /> {selectedVoucher ? selectedVoucher.code : "Apply"}
                        </button>
                    </div>

                    {/* 🏷️ Discount Display */}
                    {selectedVoucher && (
                        <div className="flex justify-between text-sm text-green-500">
                            <span>Discount ({selectedVoucher.code})</span>
                            <span>-₱{selectedVoucher.discount}</span>
                        </div>
                    )}

                    {/* Final Total */}
                    <div className="flex justify-between text-sm font-semibold mt-2">
                        <span>Total</span>
                        <span>₱{selectedVoucher ? cart.subtotal - selectedVoucher.discount : cart.subtotal}</span>
                    </div>
                </div>
            </div>

            {/* 🏦 Payment Method */}
            <div className="bg-white p-4 rounded-lg shadow-md mt-4">
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
                <div className="flex items-center mt-2">
                    <CreditCard className="w-5 h-5 text-primary mr-2" />
                    <p className="text-sm">Cash on Delivery</p>
                </div>
            </div>

            {/* ✅ Terms & Conditions + Place Order */}
            <div className="bg-white p-4 rounded-lg shadow-md mt-4">
                <Checkbox checked={agreedTerms} onChange={() => setAgreedTerms(!agreedTerms)} />
                <p className="ml-2 text-xs text-gray-700">
                    By making this purchase, you agree to our terms and conditions.
                </p>

                <Button 
                    className="w-full bg-primary text-white mt-4"
                    onPress={handlePlaceOrder}
                    disabled={!agreedTerms}
                >
                    Place Order
                </Button>
            </div>

            {/* 🎟️ Voucher Selection Modal */}
            <VoucherModal
                isOpen={isVoucherModalOpen}
                onClose={() => setVoucherModalOpen(false)}
                onSelectVoucher={(voucher) => {
                    setSelectedVoucher(voucher);
                    setVoucherModalOpen(false);
                }}
                orderTotal={cart.subtotal}
            />

            {/* 🚨 Alert Modal */}
            <AlertModal 
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                title="Warning"
                message={alertMessage}
            />
        </div>
    );
}
