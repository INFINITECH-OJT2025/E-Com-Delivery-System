import axios from "axios";

// Create an Axios instance with the baseURL from the environment variable
const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`, // This will come from your .env file
});

// Interceptor to handle 401 Unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response, // Allow the request to proceed if there's no error
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear localStorage
      localStorage.clear();

      // Redirect to login page
      window.location.href = "/login"; // You can also use `router.push("/login")` if using Next.js's `useRouter`
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
