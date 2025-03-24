'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from '@heroui/react';

import { remittanceService } from '@/services/remittanceService';
import { userService } from '@/services/userService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RemittanceFormModal({ isOpen, onClose, onSuccess }: Props) {
  const [riderId, setRiderId] = useState('');
  const [amount, setAmount] = useState('');
  const [remitDate, setRemitDate] = useState('');
  const [status, setStatus] = useState<'complete' | 'short'>('complete');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [riders, setRiders] = useState<any[]>([]);
  const [expected, setExpected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [deliveryFees, setDeliveryFees] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    const data = await userService.getRiders();
    const filtered = data.filter((r: any) => r.status !== 'banned');
    setRiders(filtered);
  };

  const handleRiderChange = async (value: string) => {
    setRiderId(value);
    setExpected(null);
    if (value) {
      try {
        const expectedValue = await remittanceService.getExpected(parseInt(value));
        setExpected(expectedValue);
      } catch (err) {
        console.error('Error fetching expected remittance:', err);
      }
    }
  };

  const handleSubmit = async () => {
    if (!riderId || !amount || !remitDate) {
      alert('Please fill in all required fields.');
      return;
    }
  
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('rider_id', riderId);
      formData.append('amount', amount);
      formData.append('remit_date', remitDate);
      formData.append('status', status);
      if (expected !== null) formData.append('expected_amount', expected.toString()); // Add expected to the form data
      if (notes) formData.append('notes', notes);
      if (status === 'short' && reason) formData.append('short_reason', reason);
      if (file) formData.append('proof_image', file);
  
      const success = await remittanceService.submit(formData);
  
      if (success) {
        onSuccess();
      } else {
        alert('Remittance submission failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
    setLoading(false);
  };
  

  return (
<Modal
  isOpen={isOpen}
  onOpenChange={onClose}
  placement="center"
  size="4xl"
  scrollBehavior="inside"
>
  <ModalContent>
    <ModalHeader className="text-xl font-bold text-gray-700">
      Add Rider Remittance
    </ModalHeader>
    <ModalBody className="space-y-6">
      {/* 💡 Two-column layout on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Select Rider */}
        <Select
          label="Select Rider"
          placeholder="Choose a rider"
          selectedKeys={riderId ? [riderId] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setRiderId(selected);
            handleRiderChange(selected);
          }}
        >
          {riders.map((rider) => (
            <SelectItem key={String(rider.id)} value={String(rider.id)}>
              {rider.name}
            </SelectItem>
          ))}
        </Select>

        {/* Remit Date */}
        <Input
          type="date"
          label="Remit Date"
          value={remitDate}
          onChange={(e) => setRemitDate(e.target.value)}
        />
      </div>

      {/* Expected */}
      {expected !== null && (
        <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded text-center">
          Expected Remittance (10%): <strong>₱{expected.toFixed(2)}</strong>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount */}
        <Input
          type="number"
          label="Amount (₱)"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            setAmount(val);
            if (expected !== null) {
              const amt = parseFloat(val);
              if (!isNaN(amt)) {
                setStatus(amt < expected ? 'short' : 'complete');
              }
            }
          }}
          max={expected ?? undefined}
        />

        {/* Status (Auto) */}
        <Select
          label="Remittance Status"
          selectedKeys={[status]}
          isDisabled
        >
          <SelectItem key="complete">Complete</SelectItem>
          <SelectItem key="short">Short</SelectItem>
        </Select>
      </div>

      {/* Reason for Shortage */}
      {status === 'short' && (
        <Textarea
          label="Reason for Shortage"
          placeholder="Explain why the remittance is short"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      )}

      {/* Notes */}
      <Textarea
        label="Notes (optional)"
        placeholder="Additional notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* Proof Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload Proof (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full px-2 py-1 border rounded text-sm"
        />
      </div>
    </ModalBody>

    <ModalFooter>
      <Button variant="bordered" onPress={onClose}>
        Cancel
      </Button>
      <Button color="primary" onPress={handleSubmit} isLoading={loading}>
        Submit
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

  );
}
