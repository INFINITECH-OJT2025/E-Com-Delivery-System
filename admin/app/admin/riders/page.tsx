"use client";

import { useEffect, useState } from "react";
import { riderService } from "@/services/riderService";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Tooltip, Card, CardBody
} from "@heroui/react";
import { FaSearch, FaArrowLeft, FaArrowRight, FaCheckCircle, FaBan } from "react-icons/fa";
import { addToast } from "@heroui/react";

export default function RidersPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalPlatformEarnings, setTotalPlatformEarnings] = useState(0);
  const [selectedLicenseImage, setSelectedLicenseImage] = useState<string | null>(null);

  // 🔥 Status Confirm Dialog
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<"approve" | "ban">("approve");

  useEffect(() => {
    fetchRiders(currentPage, searchQuery, selectedStatus);
  }, [currentPage, searchQuery, selectedStatus]);

  const fetchRiders = async (page: number, search = "", status = "") => {
    setLoading(true);
    const data = await riderService.fetchRiders(page, search, status);
    setRiders(data.riders?.data || []);
    setCurrentPage(data.riders?.current_page || 1);
    setLastPage(data.riders?.last_page || 1);
    setTotalPlatformEarnings(data.total_platform_earnings || 0);
    setLoading(false);
  };

  const handleFilterChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSearch = (e: any) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusConfirm = (rider: any, action: "approve" | "ban") => {
    setSelectedRider(rider);
    setNewStatus(action);
    setStatusModalOpen(true);
  };

  const handleStatusAction = async () => {
    if (!selectedRider) return;
    try {
      const response = await riderService.updateRiderStatus(selectedRider.id, newStatus);
      if (response.status === "success") {
        addToast({
          title: "Success",
          description: `Rider ${selectedRider.name} is now ${newStatus === "approve" ? "approved" : "banned"}.`,
          color: "success",
        });
        await fetchRiders(currentPage, searchQuery, selectedStatus);
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to update rider status.",
        color: "danger",
      });
    }
    setStatusModalOpen(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Rider Management</h1>

      {/* 💰 Total Earnings */}
      <Card className="mb-6 shadow-md bg-blue-100">
        <CardBody className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Total Platform Earnings</h2>
          <p className="text-2xl font-bold text-blue-600">₱{totalPlatformEarnings.toFixed(2)}</p>
        </CardBody>
      </Card>

      {/* 🔍 Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          placeholder="Search riders..."
          value={searchQuery}
          onChange={handleSearch}
          startContent={<FaSearch />}
          className="flex-1"
        />
        <Dropdown>
          <DropdownTrigger>
            <Button>{selectedStatus || "Filter by Status"}</Button>
          </DropdownTrigger>
          <DropdownMenu onAction={(status) => handleFilterChange(status as string)}>
            <DropdownItem key="">All</DropdownItem>
            <DropdownItem key="pending">Pending</DropdownItem>
            <DropdownItem key="approved">Approved</DropdownItem>
            <DropdownItem key="banned">Banned</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Button color="primary" onPress={() => fetchRiders(1)}>Refresh</Button>
      </div>

      {/* 📋 Riders Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table isStriped>
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>Rider</TableColumn>
              <TableColumn>Email</TableColumn>
              <TableColumn>Phone</TableColumn>
              <TableColumn>Vehicle</TableColumn>
              <TableColumn>License</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Earnings</TableColumn>
              <TableColumn>Orders</TableColumn>
              <TableColumn>Action</TableColumn>
            </TableHeader>
            <TableBody>
              {riders.length > 0 ? (
                riders.map((rider) => (
                  <TableRow key={rider.id}>
                    <TableCell>#{rider.id}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${rider.profile_image}`}
                        alt={rider.name}
                        className="w-10 h-10 rounded-full"
                      />
                      {rider.name}
                    </TableCell>
                    <TableCell>{rider.email}</TableCell>
                    <TableCell>{rider.phone_number}</TableCell>
                    <TableCell>{rider.vehicle_type || "N/A"}</TableCell>
                    <TableCell>
                      {rider.liscence_image ? (
                        <Tooltip content="Click to view full license">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${rider.liscence_image}`}
                            alt="License"
                            className="w-10 h-10 rounded cursor-pointer border"
                            onClick={() =>
                              setSelectedLicenseImage(`${process.env.NEXT_PUBLIC_API_URL}/storage/${rider.liscence_image}`)
                            }
                          />
                        </Tooltip>
                      ) : (
                        <span className="text-gray-500 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-white text-sm ${
                        rider.status === "pending" ? "bg-yellow-500" :
                        rider.status === "approved" ? "bg-green-500" :
                        "bg-red-500"
                      }`}>{rider.status}</span>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">₱{rider.total_earnings.toFixed(2)}</TableCell>
                    <TableCell>{rider.total_completed_orders}</TableCell>
                    <TableCell className="flex gap-2">
                    {(rider.status === "pending" || rider.status === "banned") && (
  <Tooltip content="Approve Rider">
    <Button color="success" isIconOnly onPress={() => handleStatusConfirm(rider, "approve")}>
      <FaCheckCircle />
    </Button>
  </Tooltip>
)}

                      {rider.status === "approved" && (
                        <Tooltip content="Ban Rider">
                          <Button color="danger" isIconOnly onPress={() => handleStatusConfirm(rider, "ban")}>
                            <FaBan />
                          </Button>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">No Riders Found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* 🔁 Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              color="secondary"
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(currentPage - 1)}
            >
              <FaArrowLeft className="mr-2" /> Previous
            </Button>
            <span className="text-lg font-semibold">
              Page {currentPage} of {lastPage}
            </span>
            <Button
              color="secondary"
              disabled={currentPage >= lastPage}
              onPress={() => setCurrentPage(currentPage + 1)}
            >
              Next <FaArrowRight className="ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* 🔍 License Viewer Modal */}
      <Modal isOpen={!!selectedLicenseImage} onClose={() => setSelectedLicenseImage(null)}>
        <ModalContent>
          <ModalHeader>License Image</ModalHeader>
          <ModalBody className="flex justify-center items-center">
            {selectedLicenseImage && (
              <img src={selectedLicenseImage} alt="License" className="max-w-full max-h-[70vh] rounded" />
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setSelectedLicenseImage(null)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ✅ Status Change Confirmation */}
      <Modal isOpen={statusModalOpen} onOpenChange={setStatusModalOpen} size="sm">
        <ModalContent>
          <ModalHeader>Change Rider Status</ModalHeader>
          <ModalBody>
            {selectedRider && (
              <p>
  {newStatus === "ban"
    ? `Are you sure you want to ban ${selectedRider.name}?`
    : `Approve rider ${selectedRider.name}?`}
</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button
  color={newStatus === "ban" ? "danger" : "success"}
  onPress={handleStatusAction}
>
  {newStatus === "ban" ? (
    <>
      <FaBan className="mr-2" /> Ban Rider
    </>
  ) : (
    <>
      <FaCheckCircle className="mr-2" /> Approve Rider
    </>
  )}
</Button>

          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
