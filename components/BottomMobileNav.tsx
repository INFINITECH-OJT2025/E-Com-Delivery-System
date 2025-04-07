"use client";

import { FiHome, FiList, FiDollarSign, FiCreditCard } from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/dashboard", icon: <FiHome />, label: "Home" },
  { href: "/orders", icon: <FiList />, label: "Orders" },
  { href: "/history", icon: <FiDollarSign />, label: "History" },
  { href: "/payout", icon: <FiCreditCard />, label: "Payout" },
];

export default function BottomMobileNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  let lastScrollY = 0;

  // ❌ Hide on certain dynamic routes (e.g. /orders/66)
  const hideOnRoutes = [
    /^\/orders\/\d+$/, // matches /orders/66, /orders/123, etc.
  ];

  const shouldHide = hideOnRoutes.some((regex) => regex.test(pathname));

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true); // scrolling up
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // Conditional rendering of the component content
    !shouldHide && (
      <nav
        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <div className="bg-white border-primary rounded-full shadow-lg px-4 py-2 flex gap-6 justify-around items-center w-[90vw] max-w-md border">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center text-xs transition ${
                  isActive ? "text-primary font-semibold" : "text-gray-400"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="text-[11px]">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    )
  );
}
