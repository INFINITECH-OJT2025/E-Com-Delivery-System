"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/services/orderService";
import {
  Button, Table, TableBody, TableHeader, TableRow, TableColumn, TableCell,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner, Card, CardBody, Input
} from "@heroui/react";
import { FaEye, FaCheck, FaTimes, FaTruck, FaClipboardCheck, FaClock } from "react-icons/fa";
import Image from "next/image";
import { Scanner } from '@yudiel/react-qr-scanner';




export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [qrInput, setQrInput] = useState("");
  
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.fetchOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  const handleConfirmOrder = (order, status) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setConfirmModalOpen(true);
  };

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus("canceled");
    setCancelModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    const response = await orderService.updateOrderStatus(selectedOrder.id, newStatus);
    if (response) {
      fetchOrders();
      setConfirmModalOpen(false);
      setViewModalOpen(false);
    }
  };

  const handleCancelConfirmed = async () => {
    if (!selectedOrder) return;
    try {
      const response = await orderService.updateOrderStatus(selectedOrder.id, "canceled");
      if (response) {
        fetchOrders();
        setCancelModalOpen(false);
        setViewModalOpen(false);
      }
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  const handleScanQR = () => {
    const orderId = parseInt(qrInput);
    const found = LOCAL_ORDERS.find((order) => order.id === orderId);
    if (found) {
      setSelectedOrder(found);
      setViewModalOpen(true);
    } else {
      alert("Order not found!");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Orders Management</h1>
  
      <div className="mb-6 max-w-md mx-auto space-y-4">
      <div className="mb-6 max-w-md mx-auto space-y-4">
  <p className="text-center font-medium">Lookup Order by QR or Manual ID</p>

  <div className="flex gap-2 items-center">
    <Button onPress={() => setShowScanner(!showScanner)}>
      {showScanner ? "Hide Scanner" : "Scan QR"}
    </Button>

    <Input
      type="number"
      placeholder="Enter Order ID"
      value={qrInput}
      onChange={(e) => setQrInput(e.target.value)}
    />
    <Button
      color="primary"
      onPress={() => {
        const manualId = parseInt(qrInput);
        const found = orders.find((o) => o.id === manualId);
        if (found) {
          setSelectedOrder(found);
          setViewModalOpen(true);
        } else {
          alert("Order not found!");
        }
      }}
    >
      Search
    </Button>
  </div>

  {showScanner && (
    <div className="rounded-md border p-2 shadow mt-4">
      <Scanner
  onScan={(result) => {
    const raw = result[0]?.rawValue ?? "";

    // Extract order ID from formats like "orderID:54"
    const matched = raw.match(/(\d+)/);
    const scannedId = matched ? parseInt(matched[1]) : NaN;

    if (!isNaN(scannedId)) {
      const found = orders.find((o) => o.id === scannedId);
      if (found) {
        setSelectedOrder(found);
        setViewModalOpen(true);
        setShowScanner(false);
      } else {
        alert("Order not found!");
      }
    }
  }}

        onError={(err) => {
          console.error("QR scan error", err);
        }}
        styles={{
          container: { width: '100%' },
          video: { borderRadius: '0.5rem', width: '100%', aspectRatio: '1/1' }
        }}
        constraints={{ facingMode: "environment" }}
      />
    </div>
  )}
</div>


  

</div>

  
{loading ? (
  <div className="flex justify-center items-center h-40">
    <Spinner size="lg" />
  </div>
) : (
  <Table isStriped aria-label="Orders Table">
  <TableHeader>
    <TableColumn>ID</TableColumn>
    <TableColumn>Customer</TableColumn>
    <TableColumn>Restaurant</TableColumn>
    <TableColumn>Order Type</TableColumn>
    <TableColumn>Scheduled Time</TableColumn>
    <TableColumn>Total Price</TableColumn>
    <TableColumn>Payment</TableColumn>
    <TableColumn>Delivery</TableColumn>
    <TableColumn>Status</TableColumn>
    <TableColumn>Actions</TableColumn>
  </TableHeader>
  <TableBody>
    {orders.length > 0 ? (
      orders.map((order) => (
        <TableRow key={order.id}>
          <TableCell>#{order.id}</TableCell>
          <TableCell>{order.customer?.name || "Unknown"}</TableCell>
          <TableCell>{order.restaurant?.name || "N/A"}</TableCell>
          <TableCell>{order.order_type.toUpperCase()}</TableCell>
          <TableCell>
            {order.scheduled_time
              ? new Date(order.scheduled_time).toLocaleString()
              : "N/A"}
          </TableCell>
          <TableCell>₱{order.total_price}</TableCell>

          <TableCell>
            <div className="flex flex-col text-sm">
              <span className="font-medium">{order.payment?.payment_method || "—"}</span>
              <span
                className={`text-xs font-semibold ${
                  order.payment?.payment_status === "success"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {order.payment?.payment_status || "pending"}
              </span>
            </div>
          </TableCell>

          <TableCell>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium text-white ${
                order.delivery_status === "delivered"
                  ? "bg-green-600"
                  : order.delivery_status === "not_assigned"
                  ? "bg-gray-400"
                  : "bg-blue-500"
              }`}
            >
              {order.delivery_status}
            </span>
          </TableCell>

          <TableCell>
            <span
              className={`px-2 py-1 rounded-full text-white text-sm ${
                order.order_status === "pending"
                  ? "bg-yellow-500"
                  : order.order_status === "confirmed"
                  ? "bg-blue-500"
                  : order.order_status === "preparing"
                  ? "bg-purple-500"
                  : order.order_status === "completed"
                  ? "bg-green-500"
                  : order.order_status === "canceled"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }`}
            >
              {order.order_status}
            </span>
          </TableCell>

          <TableCell className="flex gap-2 flex-wrap">
            <Button color="primary" onPress={() => handleViewOrder(order)}>
              <FaEye className="mr-2" /> View
            </Button>

            {order.order_status === "pending" && (
              <>
                <Button
                  color="warning"
                  onPress={() => handleConfirmOrder(order, "confirmed")}
                >
                  <FaCheck className="mr-2" /> Confirm
                </Button>
                <Button
                  color="danger"
                  onPress={() => handleCancelOrder(order)}
                >
                  <FaTimes className="mr-2" /> Cancel
                </Button>
              </>
            )}

            {order.order_status === "confirmed" && (
              <Button
                color="success"
                onPress={() => handleConfirmOrder(order, "preparing")}
              >
                <FaClipboardCheck className="mr-2" /> Preparing
              </Button>
            )}

            {/* No completed button here — vendor can't complete */}
          </TableCell>
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={10}>
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <FaClipboardCheck className="text-5xl mb-3" />
            <p className="text-lg font-medium">No orders yet.</p>
            <p className="text-sm">Orders will appear here once customers place them.</p>
          </div>
        </TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>

)}

<Modal isOpen={viewModalOpen} onOpenChange={setViewModalOpen} size="5xl">
  <ModalContent className="max-w-6xl w-full mx-auto">
    <ModalHeader className="text-2xl font-bold border-b pb-4">Order Details</ModalHeader>
    <ModalBody className="space-y-8 p-6">
      {selectedOrder && (
        <>
          {/* 🧾 Basic Info */}
          <div className="grid md:grid-cols-2 gap-6 text-lg text-gray-700">
            <div className="space-y-1">
              <p><strong>Customer:</strong> {selectedOrder.customer?.name || "Unknown"}</p>
              <p><strong>Contact:</strong> {selectedOrder.customer?.phone_number || "N/A"}</p>
              <p><strong>Order Type:</strong> {selectedOrder.order_type.toUpperCase()}</p>
              <p><strong>Total:</strong> ₱{selectedOrder.total_price}</p>
              <p><strong>Payment:</strong> {selectedOrder.payment?.payment_method || '—'} (
                <span className={`font-semibold ${
                  selectedOrder.payment?.payment_status === "success"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}>
                  {selectedOrder.payment?.payment_status || "pending"}
                </span>)
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <span
                className={`px-4 py-2 rounded-full text-white text-sm capitalize ${
                  selectedOrder.order_status === "pending"
                    ? "bg-yellow-500"
                    : selectedOrder.order_status === "confirmed"
                    ? "bg-blue-500"
                    : selectedOrder.order_status === "preparing"
                    ? "bg-purple-500"
                    : selectedOrder.order_status === "completed"
                    ? "bg-green-500"
                    : selectedOrder.order_status === "canceled"
                    ? "bg-red-500"
                    : "bg-gray-500"
                }`}
              >
                {selectedOrder.order_status}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm text-white ${
                  selectedOrder.delivery_status === "delivered"
                    ? "bg-green-600"
                    : selectedOrder.delivery_status === "not_assigned"
                    ? "bg-gray-400"
                    : "bg-blue-500"
                }`}
              >
                Delivery: {selectedOrder.delivery_status}
              </span>

              {selectedOrder.restaurant?.name && (
                <p className="text-sm text-gray-600 mt-2">
                  Restaurant: <strong>{selectedOrder.restaurant.name}</strong>
                </p>
              )}
            </div>
          </div>

          {/* 🕒 Scheduled */}
          {selectedOrder.scheduled_time && (
            <div className="flex items-center text-blue-600 font-medium text-base">
              <FaClock className="mr-2" />
              Scheduled for: {new Date(selectedOrder.scheduled_time).toLocaleString()}
            </div>
          )}

          {/* 🧾 Ordered Items */}
          <div>
            <h3 className="text-xl font-bold mb-4">Items Ordered</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedOrder.order_items.map((item) => (
                <Card key={item.id} className="shadow-md border rounded-xl overflow-hidden">
                  <CardBody className="p-4 flex flex-col items-center text-center space-y-3">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image}`}
                      alt={item.name}
                      width={150}
                      height={150}
                      className="rounded-md object-cover"
                    />
                    <h4 className="text-lg font-semibold">{item.name}</h4>
                    <p className="text-base font-medium">₱{item.price} × {item.quantity}</p>
                    <p className="text-sm font-bold text-gray-800">Subtotal: ₱{item.subtotal}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          {/* 🖼️ Delivery Proof (optional) */}
          {selectedOrder.delivery_proof && (
            <div>
              <h3 className="text-xl font-bold mb-2">Proof of Delivery</h3>
              <Image
                src={selectedOrder.delivery_proof}
                alt="Proof of Delivery"
                width={800}
                height={600}
                className="rounded-lg border object-cover w-full max-w-4xl"
              />
            </div>
          )}

          {/* 🎯 Status Update Buttons (Vendor view — no "Completed") */}
          <div className="flex flex-wrap gap-3 justify-end mt-6">
            {selectedOrder.order_status === "pending" && (
              <>
                <Button
                  color="warning"
                  onPress={() => handleConfirmOrder(selectedOrder, "confirmed")}
                >
                  <FaCheck className="mr-2" /> Confirm
                </Button>
                <Button
                  color="danger"
                  onPress={() => handleCancelOrder(selectedOrder)}
                >
                  <FaTimes className="mr-2" /> Cancel
                </Button>
              </>
            )}

            {selectedOrder.order_status === "confirmed" && (
              <Button
                color="success"
                onPress={() => handleConfirmOrder(selectedOrder, "preparing")}
              >
                <FaClipboardCheck className="mr-2" /> Mark as Preparing
              </Button>
            )}

            {/* ✅ Vendor cannot complete the order */}
          </div>
        </>
      )}
    </ModalBody>
    <ModalFooter>
      <Button variant="bordered" size="lg" onPress={() => setViewModalOpen(false)}>
        Close
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

  
      {/* Confirm Status Modal */}
      <Modal isOpen={confirmModalOpen} onOpenChange={setConfirmModalOpen} size="sm">
        <ModalContent>
          <ModalHeader>Confirm Status Update</ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <p>Mark order #{selectedOrder.id} as <strong>{newStatus}</strong>?</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setConfirmModalOpen(false)}>Cancel</Button>
            <Button color="success" onPress={handleUpdateStatus}>
              <FaCheck className="mr-2" /> Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Cancel Modal */}
      <Modal isOpen={cancelModalOpen} onOpenChange={setCancelModalOpen} size="sm">
        <ModalContent>
          <ModalHeader>Cancel Order</ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <p className="text-md">
                Are you sure you want to cancel order <strong>#{selectedOrder.id}</strong>? This action cannot be undone.
              </p>
            )}
          </ModalBody>
          <ModalFooter className="flex justify-between">
            <Button variant="bordered" onPress={() => setCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button color="danger" onPress={handleCancelConfirmed}>
              <FaTimes className="mr-2" /> Cancel Order
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
  
}
