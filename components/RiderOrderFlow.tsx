import { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardBody, CardFooter, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { useParams, useRouter } from "next/navigation";
import { RiderOrderService } from "@/services/RiderOrderService";
import { FaPhoneAlt, FaMapMarkerAlt, FaArrowRight, FaMotorcycle, FaMoneyBillWave, FaRoute,FaCamera  } from 'react-icons/fa';
import { addToast } from "@heroui/react";
interface Order {
  order_id: number;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_phone: string;
  restaurant_lat: string;
  restaurant_lng: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  customer_lat: string;
  customer_lng: string;
  subtotal: string;
  delivery_fee: string;
  rider_tip: string;
  total_price: string;
  payment_status: string;
  delivery_status: string;
  items: { menu_id: number; item_name: string; quantity: number; price: string; subtotal: string }[];
}

const RiderOrderUI = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [step, setStep] = useState<string>("assigned");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [mapUrl, setMapUrl] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await RiderOrderService.getOrderDetails(Number(orderId));
        if (response.success && response.data) {
          setOrder(response.data);
          setStep(response.data.delivery_status || "assigned"); // Sync with API
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };
    fetchOrder();
  }, [orderId]);
  useEffect(() => {
    // ✅ Interval to update rider location every 10 seconds
    const interval = setInterval(async () => {
  try {
    let storedLocation = localStorage.getItem("rider_location");
    if (!storedLocation) {
      console.error("No stored rider location found!");
      return;
    }

    let { lat, lng } = JSON.parse(storedLocation);

    // ✅ Simulate moving towards the customer
    lat += 0.0005; // Move slightly north
    lng += 0.0007; // Move slightly east

    // ✅ Update stored location (for UI consistency)
    localStorage.setItem("rider_location", JSON.stringify({ lat, lng }));

    // ✅ Send updated location to API
    const response = await RiderOrderService.updateRiderLocation(
      Number(orderId), // ✅ Using order_id
      lat,
      lng
    );

    if (!response.success) {
      console.error("Location update error:", response.message);
    } else {
      console.log("✅ Rider location updated:", { lat, lng });
    }
  } catch (error) {
    console.error("Error updating location:", error);
  }
}, 5000); // ✅ Poll every 5 seconds for testing (change to 10s in production)


    // ✅ Clean up interval on unmount
    return () => clearInterval(interval);
  }, [orderId]);
  const openMap = () => {
    if (!order) return;
    const riderLocation = JSON.parse(localStorage.getItem("rider_location") || "{}");
    if (!riderLocation.lat || !riderLocation.lng) {
      alert("Rider location not found!");
      return;
    }

    let destinationLat = order.restaurant_lat;
    let destinationLng = order.restaurant_lng;

    if (step === "picked_up" || step === "in_delivery") {
      destinationLat = order.customer_lat;
      destinationLng = order.customer_lng;
    }

    setMapUrl(
      `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${riderLocation.lat},${riderLocation.lng}&destination=${destinationLat},${destinationLng}`
    );

    onOpen();
  };

  const updateStatus = async (newStatus: string) => {
    const response = await RiderOrderService.updateOrderStatus(Number(orderId), newStatus);
    if (response.success) {
      setStep(newStatus);
      if (newStatus === "delivered") {
        addToast({
          title: "Order Delivered! ✅",
          description: "You've successfully completed the delivery.",
          color: "success",
        });
        router.push("/dashboard");
      } else {
        addToast({
          title: "Status Updated",
          description: `Order status updated to ${newStatus.replace('_', ' ')}.`,
          color: "primary",
        });
      }
    } else {
      addToast({
        title: "Error",
        description: response.message,
        color: "danger",
      });
    }
  };
  

  const handleProofImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofImage(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };
  
  const handleProofUpload = async () => {
    if (!proofImage) {
      addToast({
        title: "No Image Selected",
        description: "Please select or capture an image first!",
        color: "warning",
      });
      return;
    }
  
    const response = await RiderOrderService.uploadProofOfDelivery(Number(orderId), proofImage);
    if (response.success) {
      addToast({
        title: "Proof Uploaded ✅",
        description: "Proof uploaded successfully!",
        color: "success",
      });
      updateStatus("delivered");
    } else {
      addToast({
        title: "Upload Failed",
        description: response.message,
        color: "danger",
      });
    }
  };
  
  
  const riderEarnings = ((parseFloat(order?.delivery_fee) * 0.9) + parseFloat(order?.rider_tip || 0)).toFixed(2);

  return (
    <div className="p-4 flex flex-col gap-4 h-screen bg-gray-50 overflow-auto">
      {!order ? (
        <Button color="primary" onPress={() => window.location.reload()}>
          Reload Order
        </Button>
      ) : (
        <Card className="shadow-xl flex-1 overflow-auto relative">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="text-lg">Order #{order.order_id}-</h2>
            <p className="capitalize">{step.replace('_', ' ')}</p>
          </CardHeader>

          <CardBody className="pb-36">
            <section className="flex justify-between items-center bg-green-100 p-3 rounded">
              <div className="flex items-center gap-2">
                <FaMotorcycle className="text-green-600" />
                <p className="font-semibold">Rider Earnings:</p>
              </div>
              <p className="font-bold text-green-700">₱{riderEarnings}</p>
            </section>

            <section className="mt-4 bg-gray-100 rounded-md p-4">
              <div className="flex items-center gap-2 font-semibold">
                <FaMapMarkerAlt className="text-red-500" /> Restaurant Details
              </div>
              <p className="mt-2">{order.restaurant_name}</p>
              <p className="text-gray-600 text-sm">{order.restaurant_address}</p>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                className="mt-2"
                onPress={() => window.location.href = `tel:${order.restaurant_phone}`}>
                <FaPhoneAlt /> {order.restaurant_phone}
              </Button>
            </section>

            <section className="mt-4 bg-gray-100 rounded-md p-4">
              <div className="flex items-center gap-2 font-semibold">
                <FaMapMarkerAlt className="text-blue-500" /> Customer Details
              </div>
              <p className="mt-2">{order.customer_name}</p>
              <p className="text-gray-600 text-sm">{order.customer_address}</p>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                className="mt-2"
                onPress={() => window.location.href = `tel:${order.customer_phone}`}>
                <FaPhoneAlt /> {order.customer_phone}
              </Button>
            </section>

            <section className="mt-4 bg-gray-100 rounded-md p-4">
              <div className="flex items-center gap-2 font-semibold">
                <FaMoneyBillWave className="text-yellow-500" /> Order Summary
              </div>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between mt-2">
                  <p>{item.quantity}x {item.item_name}</p>
                  <p>₱{item.subtotal}</p>
                </div>
              ))}
              <hr className="my-2" />
              <div className="flex justify-between"><span>Subtotal:</span><span>₱{order.subtotal}</span></div>
              <div className="flex justify-between"><span>Delivery Fee:</span><span>₱{order.delivery_fee}</span></div>
              {order.rider_tip > 0 && (
                <div className="flex justify-between"><span>Rider Tip:</span><span>₱{order.rider_tip}</span></div>
              )}
              <div className="flex justify-between font-bold mt-2">
                <span>Total:</span><span>₱{order.total_price}</span>
              </div>
            </section>

            <section className="mt-4 bg-gray-100 rounded-md p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaRoute className="text-purple-500" />
                <p className="font-semibold">Distance:</p>
              </div>
              <p>{order.restaurant_to_customer_distance.toFixed(2)} km ({order.estimated_delivery_time})</p>
            </section>
          </CardBody>

          <CardFooter className="fixed bottom-0 left-0 w-full bg-white p-4 flex flex-col gap-2 shadow-lg">
            {(step === "assigned" || step === "picked_up" || step === "arrived_at_vendor" || step === "in_delivery") && (
              <Button fullWidth color="primary" onPress={openMap}>
                <FaArrowRight /> Navigate {step === 'picked_up' || step === 'in_delivery' ? 'to Customer' : 'to Restaurant'}
              </Button>
            )}

            {step === "assigned" && (
              <Button fullWidth color="success" onPress={() => updateStatus("arrived_at_vendor")}>Arrived at Restaurant</Button>
            )}

            {step === "arrived_at_vendor" && (
              <Button fullWidth color="success" onPress={() => updateStatus("picked_up")}>Pick Up Order</Button>
            )}

{step === "picked_up" && (
  <Button fullWidth color="success" onPress={() => updateStatus("in_delivery")}>
    Start Delivery
  </Button>
)}

{step === "in_delivery" && (
  <Button fullWidth color="success" onPress={() => updateStatus("arrived_at_customer")}>
    Arrived at Customer
  </Button>
)}


{step === "arrived_at_customer" && (
  <>
    {previewUrl && (
      <img
        src={previewUrl}
        alt="Proof Preview"
        className="w-full h-auto rounded-md mb-2 border"
      />
    )}
    <input
      type="file"
      accept="image/*"
      capture="environment"
      onChange={handleProofImage}
      className="mb-2"
    />
    <Button fullWidth color="success" onPress={handleProofUpload}>
      <FaCamera /> Confirm & Upload Proof
    </Button>
  </>
)}

          </CardFooter>
        </Card>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full" isDismissable={false}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Navigation Route</ModalHeader>
              <ModalBody>
                <iframe src={mapUrl} className="w-full h-full min-h-[70vh]" allowFullScreen />
              </ModalBody>

            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RiderOrderUI;
