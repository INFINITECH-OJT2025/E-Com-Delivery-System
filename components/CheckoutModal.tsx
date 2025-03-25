"use client";
import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox } from "@heroui/react";
import { MapPin, Edit, Ticket, X } from "lucide-react";
import { useCart } from "@/context/cartContext";
import { useUser } from "@/context/userContext";
import { addressService } from "@/services/addressService";
import { deliveryFeeService } from "@/services/deliveryFeeService";
import { checkoutService } from "@/services/checkoutService";
import VoucherModal from "@/components/ApplyVoucherModal";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import AlertModal from "@/components/AlertModal";

export default function CheckoutModal({ isOpen, onClose }) {
    const { cart } = useCart();
    const { user } = useUser();

    // 🔥 State Management
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [appliedVouchers, setAppliedVouchers] = useState<Record<string, any>>({});
    const [isVoucherModalOpen, setVoucherModalOpen] = useState(false);
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [riderTip, setRiderTip] = useState(0);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const { fetchCart } = useCart(); // ✅ Import fetchCart to refetch cart after order
    const [loading, setLoading] = useState(false); // ✅ Loading state for button
    const [scheduleTime, setScheduleTime] = useState(""); // Store selected time
    const [isScheduled, setIsScheduled] = useState(false); // Track if scheduling is enabled
    const [restaurant, setRestaurant] = useState(null);
    const [orderType, setOrderType] = useState("delivery");

 
    useEffect(() => {
        async function fetchInitialData() {
            if (!isOpen || !cart?.restaurant_id) return;
    
            // Fetch Addresses
            const addressResponse = await addressService.fetchAddresses();
            if (addressResponse.success) {
                setAddresses(addressResponse.data);
                setSelectedAddress(addressResponse.data.find(addr => addr.is_default) || addressResponse.data[0]);
            }
    
            // Fetch Restaurant Details
            const restaurantResponse = await checkoutService.fetchRestaurant(cart.restaurant_id);
            if (restaurantResponse.success) {
                const resData = restaurantResponse.data;
                setRestaurant(resData);
    
                // Set default order type
                if (resData.order_types.includes("pickup") && !resData.order_types.includes("delivery")) {
                    setOrderType("pickup");
                } else {
                    setOrderType("delivery");
                }
            }
        }
    
        fetchInitialData();
    }, [isOpen]);
    

    // ✅ Fetch Delivery Fee when Address Changes
    useEffect(() => {
        async function fetchDeliveryFee() {
            if (orderType !== "delivery" || !selectedAddress || !cart?.restaurant_id) return;
            const response = await deliveryFeeService.fetchDeliveryFee(
                cart.restaurant_id,
                selectedAddress.latitude,
                selectedAddress.longitude
            );
            if (response.success) setDeliveryFee(response.data.delivery_fee);
        }
    
        fetchDeliveryFee();
    
        if (orderType === "pickup") {
            setDeliveryFee(0); // Reset if pickup
        }
    }, [selectedAddress, orderType]);
    

    // ✅ Compute Discounts
    const subtotal = cart?.cart_items?.reduce((acc, item) => acc + parseFloat(item.subtotal), 0) || 0;

    const discountOnSubtotal = Object.values(appliedVouchers)
        .filter((voucher: any) => voucher.type !== "shipping") // Only apply discount to subtotal, not delivery fee
        .reduce((acc, voucher: any) => acc + (voucher.discount_percentage ? (subtotal * parseFloat(voucher.discount_percentage)) / 100 : parseFloat(voucher.discount_amount) || 0), 0);

    const discountOnShipping = Object.values(appliedVouchers)
        .filter((voucher: any) => voucher.type === "shipping") // Only apply shipping discounts
        .reduce((acc, voucher: any) => acc + parseFloat(voucher.discount_amount) || 0, 0);

    const totalDeliveryFee = Math.max(deliveryFee - discountOnShipping, 0);
    const totalPrice = Math.max(subtotal - discountOnSubtotal + totalDeliveryFee + riderTip, 0);

    // ✅ Handle Voucher Selection
    const handleVoucherSelection = (voucher: any, type: string) => {
        setAppliedVouchers((prev) => ({ ...prev, [type]: voucher }));
    };

    // ✅ Remove an Applied Voucher
    const removeVoucher = (type: string) => {
        setAppliedVouchers((prev) => {
            const newVouchers = { ...prev };
            delete newVouchers[type];
            return newVouchers;
        });
    };

    // ✅ Handle Checkout (Ensure Address is Selected)
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            setAlertMessage("Please select a delivery address.");
            setIsAlertOpen(true);
            return;
        }
    
        setLoading(true); // ✅ Show loading animation

        // ✅ Extract Cart Items
        const cartItems = cart?.cart_items?.map(item => ({
            menu_id: item.menu_id,
            quantity: item.quantity,
            price: parseFloat(item.price),
            subtotal: parseFloat(item.subtotal)
        }));
    
        // ✅ Fix Payload (No nesting in `address_id`)
        const payload = {
            restaurant_id: cart.restaurant_id,
            cart_items: cartItems,
            customer_address_id: orderType === "delivery" ? selectedAddress.id : null,
            order_type: orderType,
            total_price: totalPrice,
            delivery_fee: orderType === "delivery" ? deliveryFee : 0,
            subtotal: subtotal,
            discount_on_subtotal: discountOnSubtotal,
            discount_on_shipping: orderType === "delivery" ? discountOnShipping : 0,
            rider_tip: orderType === "delivery" ? riderTip : 0,
            voucher_codes: Object.values(appliedVouchers).map(voucher => voucher.code),
            payment_method: "cash",
            scheduled_time: orderType === "delivery" && isScheduled ? scheduleTime : null,
        };
        
        
        
    
        console.log("🔹 Checkout Payload:", payload);
    
        // ✅ Send the order request
        const response = await checkoutService.placeOrder(payload);
    
        if (!response.success) {
            setAlertMessage(response.message || "Failed to place order.");
            setIsAlertOpen(true);
            setLoading(false); // ✅ Stop loading animation if error occurs
            return;
        }
    
        setAppliedVouchers({}); // ✅ Remove applied vouchers on success
        setLoading(false); // ✅ Stop loading animation
        await fetchCart(); // ✅ Clear cart after successful order
        onClose(); // ✅ Close modal after placing order
    };
    
    
    
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} placement="bottom" size="full">
            <ModalContent className="rounded-none shadow-none">
                {/* ✅ Header */}
                <ModalHeader className="flex items-center justify-between p-4 border-b shadow-sm bg-white">
                    <h2 className="text-lg font-bold">Checkout</h2>
          
                </ModalHeader>

                {/* ✅ Scrollable Body */}
                <ModalBody className="p-4 h-[calc(100vh-160px)] overflow-y-auto bg-gray-50">
                    
                {restaurant && restaurant.order_types?.length > 0 && (
  <>
    {/* If multiple order types, show toggle buttons */}
    {restaurant.order_types.length > 1 ? (
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-semibold">Order Type</h2>
        <div className="flex gap-2 mt-2">
          {restaurant.order_types.includes("delivery") && (
            <button
              onClick={() => setOrderType("delivery")}
              className={`px-4 py-2 rounded-lg border ${
                orderType === "delivery"
                  ? "bg-primary text-white border-primary"
                  : "border-gray-300 bg-gray-100"
              }`}
            >
              Delivery
            </button>
          )}
          {restaurant.order_types.includes("pickup") && (
            <button
              onClick={() => setOrderType("pickup")}
              className={`px-4 py-2 rounded-lg border ${
                orderType === "pickup"
                  ? "bg-primary text-white border-primary"
                  : "border-gray-300 bg-gray-100"
              }`}
            >
              Pickup
            </button>
          )}
        </div>
      </div>
    ) : (
      // If only one order type is available, show alert
      <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md mb-4 text-sm">
        This restaurant only supports <strong>{restaurant.order_types[0]}</strong>. This order will be placed as <strong>{restaurant.order_types[0]}</strong>.
      </div>
    )}
  </>
)}

      

{orderType === "delivery" && (
      <>
                    {/* 🚚 Delivery Address */}

                    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                        <h2 className="text-lg font-semibold">Delivery Address</h2>
                        {selectedAddress ? (
                            <div className="flex items-center mt-3">
                                <MapPin className="text-primary w-5 h-5 mr-2" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{selectedAddress.address}</p>
                                    <p className="text-xs text-gray-500">{selectedAddress.label}</p>
                                </div>
                                {/* <button onClick={() => setAddressModalOpen(true)} className="text-primary text-sm flex items-center">
                                    <Edit className="w-4 h-4 mr-1" /> Change
                                </button> */}
                            </div>
                        ) : (
                            <p className="text-gray-500">No address selected</p>
                        )}
                    </div>
{/* 📅 Schedule Order */}
<div className="bg-white p-4 rounded-lg shadow-md mb-4">
    <h2 className="text-lg font-semibold">Schedule Order</h2>
    <div className="mt-2">
        <Checkbox checked={isScheduled} onChange={() => setIsScheduled(!isScheduled)}>
            Schedule for later
        </Checkbox>
    </div>
    {isScheduled && (
        <input 
            type="datetime-local"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full mt-2 p-2 border rounded-md text-sm"
            min={new Date().toISOString().slice(0, 16)} // Prevent past dates
        />
    )}
</div>
</>
)}
                    {/* 🎟 Apply Voucher */}
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                        <h2 className="text-lg font-semibold">Vouchers</h2>
                        {Object.keys(appliedVouchers).length > 0 ? (
                            Object.entries(appliedVouchers).map(([type, voucher]) => (
                                <div key={voucher.id} className="flex justify-between items-center p-3 bg-green-100 text-green-700 rounded-md text-sm">
                                    <span>{voucher.code} - {voucher.discount_percentage ? `${voucher.discount_percentage}% Off` : `₱${voucher.discount_amount} Off`}</span>
                                    <button className="text-red-500 text-xs" onClick={() => removeVoucher(type)}>Remove</button>
                                </div>
                            ))
                        ) : (
                            <button onClick={() => setVoucherModalOpen(true)} className="flex items-center text-primary mt-2">
                                <Ticket className="w-5 h-5 mr-1" /> Apply Voucher
                            </button>
                        )}
                    </div>

                   {/* 🚴 Tip Your Rider (Chip Buttons) */}
                   {orderType === "delivery" && (

<div className="bg-white p-4 rounded-lg shadow-md mb-4">
    <h2 className="text-lg font-semibold">Tip Your Rider</h2>
    <div className="mt-2 overflow-x-auto whitespace-nowrap">
        <div className="flex gap-2 w-max">
            {[0, 5, 10, 20, 100].map((tip) => (
                <button 
                    key={tip} 
                    className={`px-4 py-2 rounded-lg border ${riderTip === tip ? 'bg-primary text-white border-primary' : 'border-gray-300 bg-gray-100'}`}
                    onClick={() => setRiderTip(tip)}
                >
                    ₱{tip}
                </button>
            ))}
        </div>
    </div>
</div>
)}

                    {/* 🛍️ Order Summary */}
                    <div className="bg-white p-4 rounded-lg shadow-md">
    <h2 className="text-lg font-semibold">Order Summary</h2>

    {/* 🛒 Cart Items Breakdown */}
    <div className="mt-2 space-y-2 text-sm text-gray-700">
        {cart?.cart_items?.length > 0 ? (
            cart.cart_items.map((item) => (
                <div key={item.id} className="flex justify-between">
                    <span>
                        {item.quantity}x {item.menu.name}
                    </span>
                    <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
            ))
        ) : (
            <p className="text-gray-500 text-center">Your cart is empty.</p>
        )}
    </div>

    {/* ✅ Divider */}
    <hr className="my-3 border-gray-300" />

    {/* ✅ Subtotal */}
    <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>₱{totalPrice.toFixed(2)}</span>
    </div>

    {/* ✅ Delivery Fee */}
    <div className="flex justify-between text-sm">
        <span>Delivery Fee</span>
        <span>₱{totalDeliveryFee.toFixed(2)}</span>
    </div>

    {/* ✅ Applied Vouchers */}
    {appliedVouchers && Object.keys(appliedVouchers).length > 0 && (
        <>
            {Object.entries(appliedVouchers).map(([type, voucher]) => {
                const discountAmount = voucher.discount_percentage
                    ? (subtotal * parseFloat(voucher.discount_percentage)) / 100
                    : parseFloat(voucher.discount_amount) || 0;

                return (
                    <div key={voucher.id} className="flex justify-between text-sm text-green-600">
                        <span>{voucher.code} Discount</span>
                        <span>-₱{discountAmount.toFixed(2)}</span>
                    </div>
                );
            })}
        </>
    )}

    {/* ✅ Rider Tip */}
    <div className="flex justify-between text-sm">
        <span>Rider Tip</span>
        <span>₱{riderTip.toFixed(2)}</span>
    </div>

    {/* ✅ Divider */}
    <hr className="my-3 border-gray-300" />

    {/* ✅ Total Price */}
    <div className="flex justify-between text-lg font-bold mt-2">
        <span>Total</span>
        <span>₱{totalPrice.toFixed(2)}</span>
    </div>
</div>

{/* 💳 Payment Method Options */}
<div className="bg-white p-4 rounded-lg shadow-md mt-4">
  <h2 className="text-lg font-semibold mb-2">Payment Method</h2>
  <div className="space-y-2 text-sm text-gray-700">

    {/* ✅ Cash on Delivery - SELECTED */}
    <label className="flex items-center gap-3">
      <input
        type="radio"
        name="payment_method"
        checked
        readOnly
        className="accent-primary"
      />
      <span>Cash on Delivery</span>
    </label>

    {/* ❌ GCash - DISABLED */}
    <label
      className="flex items-center gap-3 text-gray-400 cursor-not-allowed"
    >
      <input type="radio" name="payment_method" disabled />
      <span>GCash (Unavailable)</span>
    </label>

    {/* ❌ Credit/Debit Card - DISABLED */}
    <label
      className="flex items-center gap-3 text-gray-400 cursor-not-allowed"

    >
      <input type="radio" name="payment_method" disabled />
      <span>Credit / Debit Card (Unavailable)</span>
    </label>
  </div>

  <p className="text-xs text-gray-500 mt-2">
    You’ll pay the rider directly upon delivery.
  </p>
</div>

                    {/* ✅ Terms Checkbox */}
                    <div className="mt-4">
                        <Checkbox checked={agreedTerms} onChange={() => setAgreedTerms(!agreedTerms)}>
                            I agree to the terms and conditions
                        </Checkbox>
                    </div>
                </ModalBody>

                {/* ✅ Fixed Footer */}
                <ModalFooter className="p-4 border-t bg-white shadow-lg flex justify-between">
                    <h1 className="text-lg font-bold">Total: ₱{totalPrice.toFixed(2)}</h1>
                  <Button 
    className="bg-primary text-white px-6" 
    onPress={handlePlaceOrder} 
    isDisabled={!agreedTerms || loading || !selectedAddress || !cart?.cart_items?.length || totalPrice <= 0} // ✅ Ensure all fields are valid before enabling
>
    {loading ? "Placing Order..." : "Place Order"}
</Button>


                </ModalFooter>
            </ModalContent>

            {/* 📍 Address Selection Modal */}
            <AddressSelectionModal isOpen={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} />

            {/* 🎟 Voucher Selection Modal */}
            <VoucherModal 
                isOpen={isVoucherModalOpen} 
                onClose={() => setVoucherModalOpen(false)} 
                onSelectVoucher={handleVoucherSelection} 
                orderTotal={subtotal}
            />

            {/* 🚨 Alert Modal */}
            <AlertModal isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} title="Warning" message={alertMessage} />
        </Modal>
    );
}