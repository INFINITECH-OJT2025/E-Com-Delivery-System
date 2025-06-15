'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from '@heroui/react';
import { Loader } from 'lucide-react';
import { addToast } from "@heroui/react";

const AdminLogs = () => {
  interface Log {
    id: number;
    log_name: string;
    description: string;
    subject_type: string;
    event: string;
    subject_id: number;
    causer_type: string;
    causer_id: number;
    properties: string;
    created_at: string;
  }

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
        },
      });
      if (res.data.success) setLogs(res.data.data);
    } catch (error) {
      console.error('Error:', error);
      addToast({ title: "Error", description: "Failed to fetch logs.", color: "danger" });
    }
    setLoading(false);
  };

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    return logs.filter((log) =>
      `${log.description} ${log.event} ${log.subject_type}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [logs, search]);

  const pages = Math.ceil(filteredLogs.length / rowsPerPage);
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredLogs.slice(start, start + rowsPerPage);
  }, [filteredLogs, page, rowsPerPage]);

  const formatJSON = (raw: string) => {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📋 Activity Logs</h1>

      {/* Search and Page Size */}
      <div className="flex items-center justify-between mb-4">
        <Input
          isClearable
          placeholder="Search description, event, or subject..."
          value={search}
          onClear={() => setSearch('')}
          onValueChange={setSearch}
          className="w-full sm:max-w-[50%]"
        />
        <label className="flex items-center text-default-400 text-sm ml-4">
          Rows:
          <select
            className="ml-2 bg-transparent border-none outline-none text-sm"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </label>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader className="animate-spin w-10 h-10" />
        </div>
      ) : (
        <Table aria-label="Activity Logs Table">
          <TableHeader>
            <TableColumn className="w-12">ID</TableColumn>
            <TableColumn>Description</TableColumn>
            <TableColumn className="w-24">Event</TableColumn>
            <TableColumn className="w-40">Subject</TableColumn>
            <TableColumn className="w-40">Causer</TableColumn>
            <TableColumn className="w-48">Date</TableColumn>
            <TableColumn className="w-20 text-center">Action</TableColumn>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell className="capitalize">{log.event}</TableCell>
                  <TableCell>{log.subject_type} (ID: {log.subject_id})</TableCell>
                  <TableCell>{log.causer_type} #{log.causer_id}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => {
                        setSelectedLog(log);
                        setShowModal(true);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-6">
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">Total: {filteredLogs.length} logs</span>
          <Pagination
            isCompact
            showControls
            color="primary"
            page={page}
            total={pages}
            onChange={setPage}
          />
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalContent className="p-6">
          <ModalHeader className="text-xl font-semibold">📄 Log Details</ModalHeader>
          <ModalBody className="space-y-4 text-sm text-gray-700">
            {selectedLog && (
              <div className="space-y-2">
                <p><strong>ID:</strong> {selectedLog.id}</p>
                <p><strong>Description:</strong> {selectedLog.description}</p>
                <p><strong>Event:</strong> {selectedLog.event}</p>
                <p><strong>Subject:</strong> {selectedLog.subject_type} (ID: {selectedLog.subject_id})</p>
                <p><strong>Causer:</strong> {selectedLog.causer_type} (ID: {selectedLog.causer_id})</p>
                <p><strong>Created At:</strong> {new Date(selectedLog.created_at).toLocaleString()}</p>
                <div>
                  <strong>Properties:</strong>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-[300px] whitespace-pre-wrap">
                    {formatJSON(selectedLog.properties)}
                  </pre>
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminLogs;
