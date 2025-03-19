"use client";

import { useEffect, useState } from "react";
import { riderService } from "@/services/riderService";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Tooltip, Card, CardBody
} from "@heroui/react";
import { FaSearch, FaArrowLeft, FaArrowRight, FaMotorcycle } from "react-icons/fa";
import { addToast } from "@heroui/react";

export default function RidersPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalPlatformEarnings, setTotalPlatformEarnings] = useState(0);

  useEffect(() => {
    fetchRiders(currentPage, searchQuery, selectedStatus);
  }, [currentPage, searchQuery, selectedStatus]);

  // ✅ Fetch Riders
  const fetchRiders = async (page: number, search = "", status = "") => {
    setLoading(true);
    const data = await riderService.fetchRiders(page, search, status);

    // ✅ Correctly access the paginated response
    setRiders(data.riders?.data || []);
    setCurrentPage(data.riders?.current_page || 1);
    setLastPage(data.riders?.last_page || 1);
    setTotalPlatformEarnings(data.total_platform_earnings || 0);
    setLoading(false);
};


  // ✅ Handle Status Filter Change
  const handleFilterChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  // ✅ Handle Search
  const handleSearch = (e: any) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Rider Management</h1>

      {/* ✅ Platform Earnings */}
      <Card className="mb-6 shadow-md bg-blue-100">
        <CardBody className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Total Platform Earnings</h2>
          <p className="text-2xl font-bold text-blue-600">₱{totalPlatformEarnings.toFixed(2)}</p>
        </CardBody>
      </Card>

      {/* ✅ Search & Filter */}
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

      {/* ✅ Riders Table */}
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
              <TableColumn>Status</TableColumn>
              <TableColumn>Total Earnings</TableColumn>
              <TableColumn>Completed Orders</TableColumn>
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
                      <span className={`px-2 py-1 rounded-full text-white text-sm ${
                        rider.status === "pending" ? "bg-yellow-500" :
                        rider.status === "approved" ? "bg-green-500" :
                        "bg-red-500"
                      }`}>{rider.status}</span>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">₱{rider.total_earnings.toFixed(2)}</TableCell>
                    <TableCell>{rider.total_completed_orders}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">No Riders Found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* ✅ Pagination Controls */}
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
    </div>
  );
}
