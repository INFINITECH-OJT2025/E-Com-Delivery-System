"use client";

import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Tooltip
} from "@heroui/react";
import { FaCheckCircle, FaBan, FaTrashAlt, FaSearch, FaArrowLeft, FaArrowRight, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { addToast } from "@heroui/react"; // ✅ Import Toast Hook

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // ✅ Sorting State
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, selectedStatus, sortColumn, sortDirection]); // ✅ Ensure updates on filter/sort changes

  // ✅ Fetch users with filters & sorting
  const fetchUsers = async () => {
    setLoading(true);
    const data = await userService.fetchUsers(currentPage, searchQuery, selectedStatus, sortColumn, sortDirection);
    setUsers(data.data || []);
    setCurrentPage(data.current_page || 1);
    setLastPage(data.last_page || 1);
    setLoading(false);
  };

  // ✅ Handle Sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc"); // Toggle sort order
    } else {
      setSortColumn(column);
      setSortDirection("asc"); // Reset to ascending when changing columns
    }
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

  // ✅ Refresh List (Reset Everything)
  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedStatus("");
    setCurrentPage(1);
    fetchUsers();
  };

  // ✅ Open Status Change Modal
  const handleOpenStatusModal = (user: any, status: string) => {
    setSelectedUser(user);
    setNewStatus(status);
    setStatusModalOpen(true);
  };

  // ✅ Open Delete Confirmation Modal
  const handleOpenDeleteModal = (user: any) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  // ✅ Update User Status
  const handleUpdateStatus = async () => {
    if (!selectedUser) return;
    const response = await userService.updateUserStatus(selectedUser.id, newStatus);
    if (response.status === "success") {
      fetchUsers();
      addToast({
        title: "Success!",
        description: `User ${selectedUser.name} is now ${newStatus}.`,
        color: "success",
      });
    } else {
      addToast({
        title: "Error",
        description: "Failed to update user status.",
        color: "danger",
      });
    }
    setStatusModalOpen(false);
  };

  // ✅ Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const response = await userService.deleteUser(selectedUser.id);
    if (response.status === "success") {
      fetchUsers();
      addToast({
        title: "Deleted",
        description: `User ${selectedUser.name} has been removed.`,
        color: "danger",
      });
    } else {
      addToast({
        title: "Error",
        description: "Failed to delete user.",
        color: "danger",
      });
    }
    setDeleteModalOpen(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
  
      {/* ✅ Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          placeholder="Search users..."
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
        <Button color="primary" onPress={handleRefresh}>Reset</Button>
      </div>
  
      {/* ✅ Users Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table isStriped>
            <TableHeader>
              <TableColumn onClick={() => handleSort("id")} className="cursor-pointer">
                ID {sortColumn === "id" && (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </TableColumn>
              <TableColumn onClick={() => handleSort("name")} className="cursor-pointer">
                Name {sortColumn === "name" && (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </TableColumn>
              <TableColumn onClick={() => handleSort("email")} className="cursor-pointer">
                Email {sortColumn === "email" && (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </TableColumn>
              <TableColumn>Role</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>#{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-white text-sm ${
                        user.status === "pending" ? "bg-yellow-500" :
                        user.status === "approved" ? "bg-blue-500" :
                        "bg-red-500"
                      }`}>{user.status}</span>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {(user.status === "pending" || user.status === "banned") && (
                        <Tooltip content="Approve">
                          <Button color="success" isIconOnly onPress={() => handleOpenStatusModal(user, "approved")}>
                            <FaCheckCircle />
                          </Button>
                        </Tooltip>
                      )}
                      {(user.status === "pending" || user.status === "approved") && (
                        <Tooltip content="Ban User">
                          <Button color="warning" isIconOnly onPress={() => handleOpenStatusModal(user, "banned")}>
                            <FaBan />
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip content="Delete User">
                        <Button color="danger" isIconOnly onPress={() => handleOpenDeleteModal(user)}>
                          <FaTrashAlt />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No Users Found</TableCell>
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
  
      {/* ✅ Status Change Modal */}
      <Modal isOpen={statusModalOpen} onOpenChange={setStatusModalOpen} size="sm">
        <ModalContent>
          <ModalHeader>Change User Status</ModalHeader>
          <ModalBody>
            {selectedUser && (
              <p>Change status of <strong>{selectedUser.name}</strong> to <strong>{newStatus}</strong>?</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button color="success" onPress={handleUpdateStatus}>
              <FaCheckCircle className="mr-2" /> Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* ✅ Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen} size="sm">
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            {selectedUser && (
              <p>Are you sure you want to delete <strong>{selectedUser.name}</strong>?</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button color="danger" onPress={handleDeleteUser}>
              <FaTrashAlt className="mr-2" /> Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}  