"use client";

import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-xl font-semibold text-white">E-COMM VENDOR</h2>
          <p className="text-sm mt-2">
            The fastest way to grow your food business. Join us and reach more customers today.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/terms" className="hover:underline">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:underline">
                Become a Vendor
              </Link>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Follow Us</h3>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="hover:text-white">
              <FaFacebook className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-white">
              <FaTwitter className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-white">
              <FaInstagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} E-COMM VENDOR. All rights reserved.
      </div>
    </footer>
  );
}
