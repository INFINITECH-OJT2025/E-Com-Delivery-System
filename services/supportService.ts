import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * ✅ Fetch all support tickets (Admin)
 */
export const fetchAllTickets = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/support/tickets`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    });
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch tickets.' };
  }
};

/**
 * ✅ Update support ticket status (Admin)
 * @param {number} ticketId
 * @param {string} newStatus
 */
export const updateTicketStatus = async (ticketId: number, newStatus: string) => {
  try {
    const response = await axios.patch(
      `${API_URL}/api/admin/support/tickets/${ticketId}/update`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
    );
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to update ticket status.' };
  }
};

/**
 * ✅ Delete a support ticket (Admin)
 * @param {number} ticketId
 */
export const deleteTicket = async (ticketId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/api/admin/support/tickets/${ticketId}/delete`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
    });
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to delete ticket.' };
  }
};
