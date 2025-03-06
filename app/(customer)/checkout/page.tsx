"use client";
import { useEffect, useState } from "react";
import { Button, Input, Textarea, Checkbox } from "@heroui/react";
import { MapPin, Edit, Home, Briefcase, Heart, PlusCircle, ArrowLeft, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { addressService } from "@/services/addressService";
import { checkoutService } from "@/services/checkoutService";
import { useCart } from "@/context/cartContext";
import AlertModal from "@/components/AlertModal";

export default function CheckoutPage() {
    const router = useRouter();
    const { cart } = useCart(); // ✅ Use cart context instead of re-fetching

    // 🔥 State Management
    const [user, setUser] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedLabel, setSelectedLabel] = useState("Home");
    const [contactlessDelivery, setContactlessDelivery] = useState(true);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    // ✅ Fetch User & Addresses on Load
    useEffect(() => {
        fetchUser();
        fetchAddresses();
    }, []);

    // ✅ Fetch User Info (Ensures name & phone exist)
    const fetchUser = async () => {
        const response = await userService.fetchUser();
        if (response.success) {
            setUser(response.data);
            checkMissingInfo(response.data);
        }
    };

    // ✅ Fetch Addresses
    const fetchAddresses = async () => {
        const response = await addressService.fetchAddresses(); // ✅ Use Address Service
        if (response.success) {
            setAddresses(response.data);
            setSelectedAddress(response.data.find(addr => addr.is_default) || response.data[0]);
        }
    };

    // ✅ Check if User is Missing Required Info
    const checkMissingInfo = (user) => {
        if (!user?.name || !user?.phone_number) {
            setAlertMessage("Please complete your profile (Name & Phone) before placing an order.");
            setIsAlertOpen(true);
        }
    };

    // ✅ Handle Checkout (Ensure Address is Selected)
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            setAlertMessage("Please select a delivery address.");
            setIsAlertOpen(true);
            return;
        }

        const response = await checkoutService.placeOrder(selectedAddress.id);

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

                {/* 🏡 Floor & Notes */}
                <div className="mt-3 space-y-2">
                    <Input placeholder="Floor (optional)" />
                    <Textarea placeholder="Note to rider - e.g. building, landmark" rows={2} />
                </div>

                {/* 🏷️ Address Labels */}
                <div className="flex gap-2 mt-3">
                    {["Home", "Work", "Partner"].map((label) => (
                        <button 
                            key={label} 
                            className={`px-3 py-1 rounded-full border ${selectedLabel === label ? "bg-primary text-white" : "border-gray-300"}`}
                            onClick={() => setSelectedLabel(label)}
                        >
                            {label}
                        </button>
                    ))}
                    <button className="px-3 py-1 rounded-full border border-gray-300 flex items-center">
                        <PlusCircle className="w-4 h-4 mr-1" /> Other
                    </button>
                </div>

                {/* ✅ Submit Address */}
                <Button className="w-full bg-primary text-white mt-4">Submit</Button>

                {/* 🔄 Contactless Delivery Toggle (✅ FIXED `onChange`) */}
                <div className="flex items-center mt-3">
                    <Checkbox checked={contactlessDelivery} onChange={() => setContactlessDelivery(!contactlessDelivery)} />
                    <p className="ml-2 text-sm text-gray-700">Contactless delivery <span className="font-semibold">{contactlessDelivery ? "On" : "Off"}</span></p>
                </div>
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

                    <div className="flex justify-between text-sm mt-2">
                        <span>Subtotal</span>
                        <span>₱{cart?.subtotal || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Standard delivery</span>
                        <span className="text-green-600">Free</span>
                    </div>
                </div>

                {/* 🏦 Payment Method (COD Only for Now) */}
                <div className="mt-4">
                    <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
                    <div className="flex items-center mt-2">
                        <CreditCard className="w-5 h-5 text-primary mr-2" />
                        <p className="text-sm">Cash on Delivery</p>
                    </div>
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
