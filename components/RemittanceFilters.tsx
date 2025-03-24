'use client';

import { useState, useEffect } from 'react';
import { Select, SelectItem, Input, Button } from '@heroui/react';
import { userService } from '@/services/userService';

export default function RemittanceFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const [riders, setRiders] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedRider, setSelectedRider] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    const data = await userService.getRiders();
    const filtered = data.filter((r: any) => r.status !== 'banned');
    setRiders(filtered);
  };

  const handleFilterChange = () => {
    const filters = {
      status: selectedStatus,
      rider: selectedRider,
      startDate,
      endDate,
    };
    onFilterChange(filters); // Pass the filters back to the parent component
  };

  return (
    <div className="flex gap-4 items-center p-4 border-b">
      {/* Date Range Filter */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-700">Start Date</label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-32"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-700">End Date</label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-32"
        />
      </div>

      {/* Status Filter */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-700">Status</label>
        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-32"
        >
          <SelectItem value="">All</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="short">Short</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </Select>
      </div>

      {/* Rider Filter */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-700">Rider</label>
        <Select
          value={selectedRider}
          onChange={(e) => setSelectedRider(e.target.value)}
          className="w-32"
        >
          <SelectItem value="">All Riders</SelectItem>
          {riders.map((rider) => (
            <SelectItem key={rider.id} value={String(rider.id)}>
              {rider.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Apply Filters Button */}
      <Button onClick={handleFilterChange} color="primary" className="ml-4">
        Apply Filters
      </Button>
    </div>
  );
}
