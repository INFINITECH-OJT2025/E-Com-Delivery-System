'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchAllTickets, updateTicketStatus, deleteTicket } from '@/services/supportService';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Select,
  SelectItem,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from '@heroui/react';
import { Loader } from 'lucide-react';
import EmailInstructions from '@/components/EmailInstructions';
import { usePendingTickets } from "@/context/PendingTicketsContext"; // ✅ Import Context

const statusColorMap: Record<'Pending' | 'In Progress' | 'Resolved', string> = {
  'Pending': 'danger',
  'In Progress': 'warning',
  'Resolved': 'success',
};
import { addToast } from "@heroui/react";

const AdminSupportTickets = () => {
  interface Ticket {
    id: number;
    subject: string;
    status: string;
    user: { name: string };
    message?: string;
  }
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState(selectedTicket?.status || '');

  useEffect(() => {
    loadTickets();
  }, []);
  const { refreshPendingCount } = usePendingTickets(); // ✅ Get refresh function

  const loadTickets = async () => {
    setLoading(true);
    const response = await fetchAllTickets();
    if (response.success) {
      setTickets(response.tickets);
    }
    setLoading(false);
  };

  const handleStatusChange = async () => {
    if (selectedTicket) {
      const response = await updateTicketStatus(selectedTicket.id, newStatus);
      if (response.success) {
        await loadTickets();
        refreshPendingCount(); // ✅ Refresh pending count
        setShowModal(false);
  
        addToast({
          title: "Status Updated",
          description: `Ticket #${selectedTicket.id} is now marked as "${newStatus}".`,
          color: "success",
        });
      } else {
        addToast({
          title: "Error",
          description: "Failed to update ticket status. Please try again.",
          color: "danger",
        });
      }
    }
  };
  
  const handleDelete = async (ticketId: number) => {
    const response = await deleteTicket(ticketId);
    if (response.message) {
      await loadTickets(); // 🔁 Reload tickets
      refreshPendingCount(); // ✅ Refresh count
  
      addToast({
        title: "Ticket Deleted",
        description: `Ticket #${ticketId} has been removed successfully.`,
        color: "danger",
      });
    } else {
      addToast({
        title: "Error",
        description: "Failed to delete ticket. Please try again.",
        color: "danger",
      });
    }
  };
  
  

  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];
  
    // Normalize search input and apply filtering
    if (search.trim() !== '') {
      filtered = filtered.filter((ticket) =>
        ticket.subject.toLowerCase().includes(search.toLowerCase())
      );
    }
  
    // Apply status filter
    if (filter !== 'All') {
      filtered = filtered.filter((ticket) => ticket.status === filter);
    }
  
    return filtered;
  }, [tickets, search, filter]);
  

  // Pagination logic using useMemo
  const pages = Math.ceil(filteredTickets.length / rowsPerPage);
  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredTickets.slice(start, start + rowsPerPage);
  }, [filteredTickets, page, rowsPerPage]);

  return (
    <div className="container mx-auto p-6">
      
      <h1 className="text-3xl font-bold mb-6">📩 Support Tickets</h1>
      <EmailInstructions />

      {/* Search, Filter, and Rows per Page */}
      <div className="mb-4 flex items-center justify-between">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Search by subject..."
          value={search}
          onClear={() => setSearch('')}
          onValueChange={(val) => setSearch(val)}
        />
        <div className="flex space-x-4">
        <Select
  selectedKeys={new Set([filter])} // Ensures selected filter is retained
  onSelectionChange={(keys) => setFilter(Array.from(keys)[0])}
  className="w-44"
>
  <SelectItem key="All">All</SelectItem>
  <SelectItem key="Pending">Pending</SelectItem>
  <SelectItem key="In Progress">In Progress</SelectItem>
  <SelectItem key="Resolved">Resolved</SelectItem>
</Select>

          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small ml-2"
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>

      {/* Ticket Table */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader className="animate-spin w-10 h-10" />
        </div>
      ) : (
        <Table aria-label="Support Tickets Table">
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Subject</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>User</TableColumn>
            <TableColumn>Email</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {paginatedTickets.length > 0 ? (
              paginatedTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <Chip color={statusColorMap[ticket.status as keyof typeof statusColorMap] || 'default'}>{ticket.status}</Chip>
                  </TableCell>
                  <TableCell>{ticket.user.name}</TableCell>
                  <TableCell>
  <a
    href={`mailto:${ticket.user.email}?subject=Regarding your support ticket - ${ticket.subject}&body=Hi, this is E-Com Delivery Service Ticket Department. \n\nThis is regarding your query: "${ticket.message}"\n\nPlease let us know how we can assist you further.`}
    className="text-primary font-semibold hover:underline"
  >
    {ticket.user.email}
  </a>
</TableCell>

                  <TableCell>
                  <Button
  onPress={() => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status); // Auto-selects current status in dropdown
    setShowModal(true);
  }}
  color="primary"
>
  View
</Button>


                    <Button color="danger" onPress={() => handleDelete(ticket.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No support tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-gray-500">Total: {filteredTickets.length} tickets</span>
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pages}
            onChange={setPage}
          />
        </div>
      )}

{/* Ticket Details Modal */}
<Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
  <ModalContent className="p-6">
    <ModalHeader className="text-xl font-semibold text-gray-800">🎟️ Ticket Details</ModalHeader>
    <ModalBody className="space-y-4">
      {selectedTicket && (
        <div className="space-y-4 text-gray-700">
          {/* Ticket Info */}
          <div className="space-y-2">
            <p className="text-lg font-medium">
              <strong>ID:</strong> #{selectedTicket.id}
            </p>
            <p className="text-lg font-medium">
              <strong>User:</strong> {selectedTicket.user.name}
            </p>
            <p className="text-lg font-medium">
              <strong>User:</strong> {selectedTicket.user.email}
            </p>
            <p>
              <strong>Subject:</strong> {selectedTicket.subject}
            </p>
            <p>
              <strong>Message:</strong> {selectedTicket.message}
            </p>
          </div>

          {/* Status Section */}
          <hr className="border-gray-300" />
          <div className="space-y-2">
            <p className="text-lg font-semibold">Current Status:</p>
            <Chip color={statusColorMap[selectedTicket.status]} size="lg">
              {selectedTicket.status}
            </Chip>
          </div>

          {/* Status Update Section */}
          <div className="space-y-2">
            <label className="block text-lg font-semibold">Update Status</label>
            <Select
  selectedKeys={new Set([newStatus])} // Ensure correct selected state
  onSelectionChange={(keys) => setNewStatus(Array.from(keys)[0])}
  className="w-full border-gray-300 rounded-lg"
>
  <SelectItem key="Pending">Pending</SelectItem>
  <SelectItem key="In Progress">In Progress</SelectItem>
  <SelectItem key="Resolved">Resolved</SelectItem>
</Select>


            
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="ghost" onPress={() => setShowModal(false)}>Cancel</Button>
            <Button color="primary" onPress={handleStatusChange}>Update Status</Button>
          </div>
        </div>
      )}
    </ModalBody>
  </ModalContent>
</Modal>

    </div>
  );
};

export default AdminSupportTickets;
