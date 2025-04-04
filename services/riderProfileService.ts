// src/services/riderProfileService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const riderProfileService = {
  async updateProfile(data: {
    name: string;
    email: string;
    phone_number: string;
    profile_image?: File | null; // ✅ Optional file
  }) {
    const token = localStorage.getItem("riderToken");
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone_number", data.phone_number);

    // ✅ Only append file if it's a File instance
    if (data.profile_image instanceof File) {
      formData.append("profile_image", data.profile_image);
    }

    const res = await fetch(`${API_URL}/api/rider/profile/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return await res.json();
  },
};
