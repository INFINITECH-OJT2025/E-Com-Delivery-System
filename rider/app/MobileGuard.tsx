"use client";

import { useEffect, useState } from "react";
import PWAInstallModal from "@/components/PWAInstallModal";
import axiosInstance from "@/services/axios"; // Import your custom axios instance
import { useRouter } from "next/navigation";  // Import Next.js router

declare global {
  interface Window {
    deferredPrompt?: Event;
  }
}

export default function MobileGuard({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();  // Initialize router

  useEffect(() => {
    const isMobile = window.innerWidth <= 1024;
    const accepted = localStorage.getItem("desktopWarningAccepted");

    if (!isMobile && !accepted) {
      setShowModal(true);
    }

    // Listen for the "beforeinstallprompt" event for PWA install
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    });

    // Interceptor to handle 401 Unauthorized errors globally
    axiosInstance.interceptors.response.use(
      (response) => response, // Allow the request to proceed if there's no error
      (error) => {console.log('hi');
        if (error.response && error.response.status === 401) {
          // Clear localStorage
          localStorage.clear();

          // Redirect to the login page
          router.push("/login");
        }
        return Promise.reject(error);
      }
    );
  }, [router]); // Make sure router is available for navigation

  return (
    <>
      {showModal && <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />}
      {children}
    </>
  );
}
