"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from "@heroui/react";
import NextLink from "next/link";
import Image from "next/image";
import { authService } from "@/services/authService";
import { ThemeSwitch } from "@/components/theme-switch";

interface AdminRoute {
  name: string;
  path: string;
}

const adminRoutes: AdminRoute[] = [
  // { name: "Restaurants", path: "/admin/restaurants" },
  { name: "Users", path: "/admin/users" },
  { name: "Riders", path: "/admin/riders" },
];

export default function AdminNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="text-white bg-primary"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent>
        <NavbarMenuToggle className="md:hidden" />
        <NavbarBrand>
          <NextLink href="/admin" className="flex items-center gap-2">
            <Image src="/images/delivery-panda.png" alt="Logo" width={40} height={40} priority />
            <p className="font-bold text-lg">E-Com Admin Portal</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {isLoggedIn && (
        <NavbarContent className="hidden md:flex" justify="end">
          {adminRoutes.map((route) => (
            <NavbarItem key={route.path}>
              <NextLink href={route.path} className="text-white hover:text-gray-200">
                {route.name}
              </NextLink>
            </NavbarItem>
          ))}

          <NavbarItem>
            <Button color="danger" onPress={handleLogout}>
              Logout
            </Button>
          </NavbarItem>
        </NavbarContent>
      )}

      <NavbarContent justify="end">
        <ThemeSwitch className="text-white" />
      </NavbarContent>

      {/* Mobile View Menu */}
      <NavbarMenu className="bg-primary text-white">
        {adminRoutes.map((route) => (
          <NavbarMenuItem key={route.path}>
            <NextLink
              href={route.path}
              className="block py-2 text-white hover:bg-primary/80"
              onClick={() => setIsMenuOpen(false)}
            >
              {route.name}
            </NextLink>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Button color="danger" className="w-full mt-2" onPress={handleLogout}>
            Logout
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </HeroUINavbar>
  );
}
