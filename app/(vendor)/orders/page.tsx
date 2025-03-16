"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/services/orderService";
import {
  Button, Table, TableBody, TableHeader, TableRow, TableColumn, TableCell,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner, Card, CardBody
} from "@heroui/react";
import { FaEye, FaCheck } from "react-icons/fa";
import Image from "next/image";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await orderService.fetchOrders();
    setOrders(data);
    setLoading(false);
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

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    const response = await orderService.updateOrderStatus(selectedOrder.id, newStatus);
    if (response) {
      fetchOrders();
      setConfirmModalOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Orders Management</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table isStriped aria-label="Orders Table">
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Customer</TableColumn>
            <TableColumn>Total Price</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell>₱{order.total_price}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-white text-sm ${
                        order.order_status === "pending" ? "bg-yellow-500" :
                        order.order_status === "confirmed" ? "bg-blue-500" :
                        order.order_status === "preparing" ? "bg-purple-500" :
                        order.order_status === "delivered" ? "bg-green-500" :
                        "bg-red-500"
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button color="primary" onPress={() => handleViewOrder(order)}>
                      <FaEye className="mr-2" /> View
                    </Button>

                    {order.order_status === "pending" && (
                      <Button color="warning" onPress={() => handleConfirmOrder(order, "confirmed")}>
                        <FaCheck className="mr-2" /> Confirm Order
                      </Button>
                    )}

                    {order.order_status === "confirmed" && (
                      <Button color="success" onPress={() => handleConfirmOrder(order, "preparing")}>
                        <FaCheck className="mr-2" /> Mark as Preparing
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No Orders Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* ✅ View Order Details Modal */}
      <Modal isOpen={viewModalOpen} onOpenChange={setViewModalOpen} size="lg">
        <ModalContent>
          <ModalHeader>Order Details</ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <div className="space-y-4">
                <p className="text-lg font-semibold">Customer: {selectedOrder.customer.name}</p>
                <p className="text-lg">Total: <span className="font-bold">₱{selectedOrder.total_price}</span></p>
                <p className="text-lg">Status: 
                  <span className={`ml-2 px-2 py-1 rounded-full text-white text-sm ${
                    selectedOrder.order_status === "pending" ? "bg-yellow-500" :
                    selectedOrder.order_status === "confirmed" ? "bg-blue-500" :
                    selectedOrder.order_status === "preparing" ? "bg-purple-500" :
                    selectedOrder.order_status === "delivered" ? "bg-green-500" :
                    "bg-red-500"
                  }`}>
                    {selectedOrder.order_status}
                  </span>
                </p>

                {/* Order Items */}
                <h3 className="text-xl font-bold">Items Ordered</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedOrder.order_items.map((item) => (
                    <Card key={item.id} className="shadow-md">
                      <CardBody className="flex flex-col items-center">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.menu.image}`}
                          alt={item.menu.name}
                          width={100}
                          height={100}
                          className="rounded-md"
                        />
                        <h4 className="text-lg font-semibold mt-2">{item.menu.name}</h4>
                        <p className="text-gray-500 text-sm">{item.menu.description}</p>
                        <p className="text-md font-bold">₱{item.menu.price} x {item.quantity}</p>
                        <p className="text-sm text-gray-700">Subtotal: ₱{item.subtotal}</p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setViewModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ✅ Confirm Order Status Modal */}
      <Modal isOpen={confirmModalOpen} onOpenChange={setConfirmModalOpen} size="sm">
        <ModalContent>
          <ModalHeader>Confirm Status Update</ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <p>Are you sure you want to mark order #{selectedOrder.id} as <strong>{newStatus}</strong>?</p>
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
    </div>
  );
}
