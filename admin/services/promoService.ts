import axios from 'axios';

// Get the API base URL
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`;

// Helper to get auth headers with latest token
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getVouchers = async () => {
  try {
    const response = await axios.get(`${API_URL}/vouchers`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch vouchers');
  }
};

export const createVoucher = async (voucherData: any) => {
  try {
    const response = await axios.post(`${API_URL}/vouchers`, voucherData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create voucher');
  }
};

export const getVoucher = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/vouchers/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch voucher');
  }
};

export const updateVoucher = async (id: number, voucherData: any) => {
  try {
    const response = await axios.put(`${API_URL}/vouchers/${id}`, voucherData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update voucher');
  }
};

export const deleteVoucher = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/vouchers/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete voucher');
  }
};
