export interface Remittance {
    id: number;
    rider_id: number;
    rider?: {
      name: string;
    };
    amount: number;
    remit_date: string;
    status: 'pending' | 'remitted' | 'verified';
    notes?: string;
    proof_image?: string;
  }
  