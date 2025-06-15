const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const RiderAnalyticsService = {
    async getTopZones(lat?: number, lng?: number) {
        const token = localStorage.getItem("riderToken");
      
        const query = lat && lng ? `?lat=${lat}&lng=${lng}` : "";
      
        const res = await fetch(`${API_URL}/api/rider/analytics/zones${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      
        return await res.json();
      },

  async getPeakHours() {
    const token = localStorage.getItem("riderToken");
    const res = await fetch(`${API_URL}/api/rider/analytics/peak-hours`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  },

  async getCompletionRate() {
    const token = localStorage.getItem("riderToken");
    const res = await fetch(`${API_URL}/api/rider/analytics/completion-rate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  },

  async getEarningsTrend() {
    const token = localStorage.getItem("riderToken");
    const res = await fetch(`${API_URL}/api/rider/analytics/earnings-trend`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  },
};
