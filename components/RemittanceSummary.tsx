import { Remittance } from '@/types/remittance';

export default function RemittanceSummary({ remittances }: { remittances: Remittance[] }) {
  const total = remittances.reduce((sum, r) => sum + Number(r.amount), 0);
  const complete = remittances.filter(r => r.status === 'complete' || r.status === 'completed').length;
  const short = remittances.filter(r => r.status === 'short').length;

  return (
    <div className="grid sm:grid-cols-3 gap-4 text-sm font-medium">
      <div className="bg-white p-4 rounded shadow border">Total Amount: <span className="font-bold text-blue-600">₱{total.toFixed(2)}</span></div>
      <div className="bg-white p-4 rounded shadow border">Complete: <span className="text-green-600">{complete}</span></div>
      <div className="bg-white p-4 rounded shadow border">Short: <span className="text-red-500">{short}</span></div>
    </div>
  );
}
