import axios from 'axios';
import { Remittance } from '@/types/remittance';

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const remittanceService = {
  async getAll(): Promise<Remittance[]> {
    const res = await axios.get(`${BASE}/remittances`, { headers: getAuthHeaders() });
    return res.data.remittances;
  },

  async getOne(id: number): Promise<Remittance | null> {
    const res = await axios.get(`${BASE}/remittances/${id}`, { headers: getAuthHeaders() });
    return res.data.remittance || null;
  },

  async submit(formData: FormData): Promise<boolean> {
    try {
      await axios.post(`${BASE}/remittances`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return true;
    } catch (e) {
      console.error("Failed to submit remittance", e);
      return false;
    }
  },
  
    // ✅ ADD THIS FUNCTION
    async getExpected(riderId: number): Promise<number> {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${BASE}/remittances/expected?rider_id=${riderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        return data.expected || 0;
      },

  async update(id: number, data: Partial<Remittance>): Promise<boolean> {
    try {
      await axios.put(`${BASE}/remittances/${id}`, data, { headers: getAuthHeaders() });
      return true;
    } catch (e) {
      console.error("Failed to update remittance", e);
      return false;
    }
  }
};
