"use client";

import React from "react";

interface Props {
  onProceed: () => void;
}

export default function DesktopWarning({ onProceed }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
        <h2 className="text-xl font-bold mb-4">Mobile-Only Experience</h2>
        <p className="mb-4 text-gray-700">
          This app is optimized for mobile and tablet devices. For the best experience, please use a mobile device or install it as a PWA.
        </p>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={onProceed}
        >
          Proceed Anyway
        </button>
      </div>
    </div>
  );
}
