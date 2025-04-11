"use client";

import { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Spinner,
  Button,
  Input,
  Select,
  SelectItem,
  Pagination,
} from "@heroui/react";
import { FaSearch, FaQrcode } from "react-icons/fa";

import OrderGrid from "@/components/orders/OrderGrid";
import OrderList from "@/components/orders/OrderList";
import OrderFormModal from "@/components/orders/OrderModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import QRScanner from "@/components/orders/QRScanner";

import { orderService } from "@/services/orderService";
import { addToast } from "@heroui/toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scheduleFilter, setScheduleFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");

  const [tabKey, setTabKey] = useState("grid");
  const [showScanner, setShowScanner] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await orderService.fetchOrders();
    if (data?.length) setOrders(data);
    setLoading(false);
  };

  const handleQRScan = (raw: string) => {
    const matched = raw.match(/(\d+)/);
    const scannedId = matched ? parseInt(matched[1]) : NaN;
    if (!isNaN(scannedId)) {
      const found = orders.find((o) => o.id === scannedId);
      if (found) {
        setSelectedOrder(found);
        setViewModalOpen(true);
        setShowScanner(false);
      } else {
        addToast({
          title: "Order not found",
          description: "Invalid QR code scanned.",
          color: "danger",
        });
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;
    const matchesSchedule =
      scheduleFilter === "all" ||
      (scheduleFilter === "scheduled" && !!order.scheduled_time) ||
      (scheduleFilter === "nonscheduled" && !order.scheduled_time);
    const matchesType =
      orderTypeFilter === "all" || order.order_type === orderTypeFilter;

    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSchedule && matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleDelete = (id: number) => {
    setOrderToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete !== null) {
      setLoading(true);
      const res = await orderService.deleteOrder(orderToDelete);
      if (res.success !== false) {
        addToast({ title: "Deleted", description: "Order deleted", color: "danger" });
        fetchOrders();
      }
      setDeleteModalOpen(false);
      setLoading(false);
    }
  };

  const closeAllModals = () => {
    setViewModalOpen(false);
    setSelectedOrder(null);
    setOrderToDelete(null);
    setDeleteModalOpen(false);
  };

  const orderStatusOptions = [
    { key: "all", label: "All Orders" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "preparing", label: "Preparing" },
    { key: "completed", label: "Completed" },
    { key: "canceled", label: "Canceled" },
  ];

  const scheduleOptions = [
    { key: "all", label: "All" },
    { key: "scheduled", label: "Scheduled" },
    { key: "nonscheduled", label: "Non-Scheduled" },
  ];

  const orderTypeOptions = [
    { key: "all", label: "All Types" },
    { key: "delivery", label: "Delivery" },
    { key: "pickup", label: "Pickup" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Manage Orders</h1>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6">
        <div className="md:col-span-4">
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<FaSearch />}
            className="w-full"
            variant="bordered"
          />
        </div>

        <div className="md:col-span-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full"
            placeholder="Status"
            variant="bordered"
          >
            {orderStatusOptions.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2">
          <Select
            value={scheduleFilter}
            onChange={(e) => setScheduleFilter(e.target.value)}
            className="w-full"
            placeholder="Schedule"
            variant="bordered"
          >
            {scheduleOptions.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2">
          <Select
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
            className="w-full"
            placeholder="Type"
            variant="bordered"
          >
            {orderTypeOptions.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>
        </div>

        <div className="md:col-span-2">
          <Button
            color={showScanner ? "danger" : "primary"}
            onPress={() => setShowScanner((prev) => !prev)}
            className="w-full"
          >
            <FaQrcode className="mr-2" />
            {showScanner ? "Close Scanner" : "Scan QR"}
          </Button>
        </div>
      </div>

      {/* QR Scanner */}
      <QRScanner visible={showScanner} onScan={handleQRScan} />

      {/* Tabs */}
      <div className="flex items-center justify-between mb-2">
        <Tabs
          selectedKey={tabKey}
          onSelectionChange={(key) => setTabKey(key as string)}
          variant="solid"
        >
          <Tab key="grid" title="Grid View" />
          <Tab key="list" title="List View" />
        </Tabs>

        <span className="text-sm text-gray-500">
          Showing {filteredOrders.length} order{filteredOrders.length !== 1 && "s"}
        </span>
      </div>

      {/* Orders View */}
      <div className="mb-6">
        {loading ? (
          <Spinner size="lg" />
        ) : tabKey === "grid" ? (
          <OrderGrid
            orders={paginatedOrders}
            onDelete={handleDelete}
            onView={(order) => {
              setSelectedOrder(order);
              setViewModalOpen(true);
            }}
          />
        ) : (
          <OrderList
            orders={paginatedOrders}
            onDelete={handleDelete}
            onView={(order) => {
              setSelectedOrder(order);
              setViewModalOpen(true);
            }}
          />
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="text-sm text-default-400">
          Rows per page:
          <select
            className="ml-2 bg-transparent outline-none text-default-500 text-sm"
            value={rowsPerPage}
            onChange={(e) => {
              setCurrentPage(1);
              setRowsPerPage(parseInt(e.target.value));
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>

        <Pagination
          page={currentPage}
          total={totalPages}
          onChange={setCurrentPage}
          variant="flat"
          showControls
          color="primary"
        />
      </div>

      {/* Modals */}
      <OrderFormModal
        viewModalOpen={viewModalOpen}
        selectedOrder={selectedOrder}
        closeAllModals={closeAllModals}
        openConfirmModal={(order, status) => {
          setSelectedOrder(order);
          fetchOrders();
        }}
        openCancelModal={(order) => {
          setSelectedOrder(order);
          fetchOrders();
        }}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
