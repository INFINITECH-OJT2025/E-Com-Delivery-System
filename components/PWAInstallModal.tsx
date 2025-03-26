"use client";

import { useEffect, useState } from "react";
import { Modal, Button, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";


export default function PWAInstallModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    setIsIOS(/iPhone|iPad|iPod/.test(navigator.userAgent));
    setIsAndroid(/Android/.test(navigator.userAgent));
  }, []);

  const handleAndroidInstall = () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then(() => {
        window.deferredPrompt = null;
      });
    } else {
      alert("PWA installation is not available on this browser.");
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="full" backdrop="blur" hideCloseButton={true} isKeyboardDismissDisabled={false} isDismissable={false} scrollBehavior="inside">
      <ModalContent className="w-screen h-screen flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
          
          {/* Left Side - App Screenshot with Gradient */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <img src="/images/iPhone-13-PRO-localhost.png" alt="App Screenshot" className="w-3/4 md:w-1/2 max-w-md rounded-lg shadow-lg" />
          </div>

          {/* Right Side - Download Section */}
          <div className="flex flex-col items-center justify-center text-center px-6 py-6 bg-white w-full">
            
            {/* Logo */}
            <img src="/images/delivery-panda.png" alt="App Logo" className="w-20 md:w-28 h-20 md:h-28 mb-4" />

            <ModalHeader className="text-2xl md:text-3xl font-bold">Download Our App</ModalHeader>
            <p className="text-gray-600 mt-2 mb-6 text-sm md:text-base">
              Get the best experience by installing our app.
            </p>

            {/* Android Download Button */}
          
              <button
                onClick={handleAndroidInstall}
                className="flex items-center justify-center bg-black text-white w-full max-w-sm py-3 rounded-lg mb-4 shadow-md hover:bg-gray-900 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24">
                  <path d="M18 15.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-12-3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14.7-2.1L12.9 3H6v16h2v-5h8v5h2v-7.1l3.7 3.7 1.4-1.4-4.4-4.3z" />
                </svg>
                <span className="font-semibold uppercase">Download on Android</span>
              </button>
            

            {/* iOS Download Button */}
            
      
            <button
              onClick={() =>
                alert("To install on iOS:\n1. Tap the Share button (📤) in Safari.\n2. Scroll down and select 'Add to Home Screen'.\n3. Tap 'Add' to confirm.")
              }
              className="flex items-center justify-center bg-black text-white w-full max-w-sm py-3 rounded-lg shadow-md hover:bg-gray-900 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="white" viewBox="0 0 24 24">
                <path d="M17.6 14.1c0-3.6 2.9-5.4 3-5.5-1.7-2.5-4.3-2.8-5.2-2.8-2.2-.2-4.3 1.3-5.4 1.3-1.2 0-2.8-1.3-4.6-1.2-2.3.1-4.4 1.3-5.6 3.3-2.4 4.1-.6 10.2 1.7 13.6 1.1 1.6 2.3 3.3 3.9 3.3s2.2-1 4.1-1 2.4 1 4.1 1 2.7-1.5 3.8-3c.8-1.2 1.1-2.4 1.1-2.5-.1-.1-2.2-.9-2.2-3.8zM13.6 3.8c1.1-1.3 1.9-3.1 1.7-4.8-1.6.1-3.5 1.1-4.6 2.4-.9 1.1-1.8 2.9-1.5 4.6 1.8.1 3.5-1 4.4-2.2z" />
              </svg>
              <span className="font-semibold uppercase">Download on iOS</span>
            </button>

            {/* Proceed Anyway Button */}
            <ModalFooter className="w-full flex flex-col items-center mt-6">
              <Button className="bg-blue-500 text-white w-full max-w-sm" onPress={onClose}>
                Proceed Anyway
              </Button>
            </ModalFooter>

          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
