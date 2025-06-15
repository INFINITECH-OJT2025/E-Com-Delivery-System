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
   // ✅ New method for uploading license image
   async uploadLicenseImage(file: File) {
    const token = localStorage.getItem("riderToken");

    if (!file) {
      return { status: "error", message: "No file selected" };
    }

    const formData = new FormData();
    formData.append("license_image", file);

    const res = await fetch(`${API_URL}/api/rider/profile/upload-license-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return await res.json();
  },
// ✅ New method: update vehicle info
async updateVehicle(data: {
  vehicle_type: string;
  plate_number: string;
}) {
  const token = localStorage.getItem("riderToken");

  const res = await fetch(`${API_URL}/api/rider/vehicle/update`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vehicle_type: data.vehicle_type,
      plate_number: data.plate_number,
    }),
  });

  return await res.json();
},
async changePassword(data: { currentPassword: string; newPassword: string }) {
  const token = localStorage.getItem("riderToken");

  // Ensure the token is available before proceeding
  if (!token) {
    return { status: "error", message: "Authentication token not found" };
  }

  try {
    const response = await fetch(`${API_URL}/api/change-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        new_password_confirmation: data.newPassword, // Add confirmation field if needed
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to change password.");
    }

    return result;
  } catch (error) {
    return { status: "error", message: error.message || "An error occurred" };
  }
},
};
