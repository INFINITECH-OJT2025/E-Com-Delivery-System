import axios from "axios";

// ✅ Create an Axios instance with default settings
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// ✅ Automatically attach Bearer token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
