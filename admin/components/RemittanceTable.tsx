'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Spinner,
  Badge,
  Button,
} from '@heroui/react';
import { Image } from '@heroui/image';
import { Remittance } from '@/types/remittance';
import RemittanceFormModal from "@/components/RemittanceFormModal"; // ✅ Your modal form
import { useState } from 'react';

const downloadCSV = (remittances: Remittance[]) => {
  const header = [
    'ID',
    'Rider',
    'Amount',
    'Expected',
    'Status',
    'Reason',
    'Date',
    'Approver',
    'Proof Image',
  ];
  const rows = remittances.map((r) => [
    r.id,
    r.rider?.name || '—',
    `₱${parseFloat(r.amount).toFixed(2)}`,
    `₱${parseFloat(r.expected_amount || 0).toFixed(2)}`,
    r.status.toUpperCase(),
    r.is_short ? r.short_reason || '—' : '—',
    new Date(r.remit_date).toLocaleDateString(),
    r.approver?.name || '—',
    r.proof_image ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${r.proof_image}` : '—',
  ]);

  const csvContent = [
    header.join(','), // Header row
    ...rows.map((row) => row.join(',')), // Data rows
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'remittance_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function RemittanceTable({
  remittances,
  loading,  fetchRemittances,

}: {
  remittances: Remittance[];
  loading: boolean;
  fetchRemittances: () => void;
}) {
  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'completed':
        return 'primary';
      case 'short':
        return 'danger';
      case 'remitted':
        return 'warning';
      default:
        return 'default';
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div >
      <div className="flex justify-end p-4 gap-3">
      <Button onPress={() => setIsModalOpen(true)} color="primary">
        Add Remittance
      </Button>
        <Button onPress={() => downloadCSV(remittances)} color="secondary" className="px-4 py-2">
          Export CSV
        </Button>
      </div>
      <Table aria-label="Remittance Table" isStriped className="min-w-[1000px]">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn className="text-primary">Rider</TableColumn>
          <TableColumn>Amount</TableColumn>
          <TableColumn>Expected</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Reason</TableColumn>
          <TableColumn>Date</TableColumn>
          <TableColumn>Approver</TableColumn>
          <TableColumn>Proof</TableColumn>
        </TableHeader>
        <TableBody>
          {remittances.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium text-gray-700">{r.id}</TableCell>
              <TableCell className="text-blue-700 font-semibold">
                {r.rider?.name || '—'}
              </TableCell>
              <TableCell className="text-green-700 font-medium">
                ₱{parseFloat(r.amount).toFixed(2)}
              </TableCell>
              <TableCell className="text-gray-600">
                ₱{parseFloat(r.expected_amount || 0).toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge color={getStatusColor(r.status)} variant="solid">
                  {r.status.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-red-600 max-w-[200px] truncate">
                {r.is_short ? r.short_reason || '—' : '—'}
              </TableCell>
              <TableCell className="text-gray-500 text-sm">
                {new Date(r.remit_date).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-purple-700 text-sm">
                {r.approver?.name || '—'}
              </TableCell>
              <TableCell>
                {r.proof_image ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${r.proof_image}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${r.proof_image}`}
                      alt="Proof"
                      width={60}
                      height={60}
                      className="rounded-lg hover:scale-110 transition-transform duration-200 object-cover border"
                    />
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm">None</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <RemittanceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchRemittances();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
