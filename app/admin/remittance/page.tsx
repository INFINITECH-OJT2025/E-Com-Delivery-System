'use client';

import { useEffect, useState } from 'react';
import { Remittance } from '@/types/remittance';
import { remittanceService } from '@/services/remittanceService';
import RemittanceTable from '@/components/RemittanceTable';
import RemittanceSummary from '@/components/RemittanceSummary';
import RemittanceFilters from '@/components/RemittanceFilters';
import { Button } from '@heroui/button';

export default function RemittancePage() {
  const [remittances, setRemittances] = useState<Remittance[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchRemittances = async () => {
    setLoading(true);
    const data = await remittanceService.getAll();
    setRemittances(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRemittances();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Rider Remittances</h1>
      <RemittanceSummary remittances={remittances} />
      {/* <RemittanceFilters />
      */}
      <RemittanceTable remittances={remittances} loading={loading} />
    
    </div>
  );
}
