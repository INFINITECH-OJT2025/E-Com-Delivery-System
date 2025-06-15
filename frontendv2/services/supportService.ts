import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * ✅ Submit a new support ticket
 * @param {string} subject
 * @param {string} message
 * @returns {Promise<any>}
 */
export const submitSupportTicket = async (subject: string, message: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/support/tickets`,
      { subject, message },
      { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }
    );
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to submit ticket.' };
  }
};

/**
 * ✅ Fetch user’s submitted tickets
 * @returns {Promise<any>}
 */
export const fetchUserTickets = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/support/tickets`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
    });
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch tickets.' };
  }
};

/**
 * ✅ Fetch a single ticket details
 * @param {number} ticketId
 * @returns {Promise<any>}
 */
export const fetchTicketDetails = async (ticketId: number) => {
  try {
    const response = await axios.get(`${API_URL}/api/support/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
    });
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch ticket details.' };
  }
};

