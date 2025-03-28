"use client";

import { useEffect, useState } from "react";
import PWAInstallModal from "@/components/PWAInstallModal";

declare global {
  interface Window {
    deferredPrompt?: Event;
  }
}

export default function MobileGuard({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth <= 1024;
    const accepted = localStorage.getItem("desktopWarningAccepted");

    if (!isMobile && !accepted) {
      setShowModal(true);
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    });
  }, []);

  return (
    <>
      {showModal && <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />}
      {children}
    </>
  );
}
