"use client";

import { useState } from "react";
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
  Badge,
} from "@heroui/react";
import NextLink from "next/link";
import Image from "next/image";
import { authService } from "@/services/authService";
import { ThemeSwitch } from "@/components/theme-switch";
import { usePendingTickets } from "@/context/PendingTicketsContext"; // ✅ Import context

// ✅ Lucide Icons
import { Users, Bike, Ticket } from "lucide-react";

interface AdminRoute {
  name: string;
  path: string;
  icon: JSX.Element;
  showBadge?: boolean;
}

const adminRoutes: AdminRoute[] = [
  { name: "Users", path: "/admin/users", icon: <Users size={18} /> },
  { name: "Riders", path: "/admin/riders", icon: <Bike size={18} /> },
  { name: "Tickets", path: "/admin/tickets", icon: <Ticket size={18} />, showBadge: true },
];

export default function AdminNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pendingCount } = usePendingTickets(); // ✅ Get ticket count from context
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="bg-primary text-white"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* Logo / Brand */}
      <NavbarContent>
        <NavbarMenuToggle className="md:hidden" />
        <NavbarBrand>
          <NextLink href="/admin" className="flex items-center gap-2">
            <Image src="/images/delivery-panda.png" alt="Logo" width={40} height={40} priority />
            <p className="font-bold text-lg">E-Com Admin Portal</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation */}
      <NavbarContent className="hidden md:flex" justify="end">
        {adminRoutes.map((route) => (
          <NavbarItem key={route.path}>
            <NextLink href={route.path} className="flex items-center">
              <Button
                variant="light"
                className="text-white hover:bg-primary/80 flex items-center gap-2"
                isIconOnly={false}
              >
                {route.showBadge && pendingCount > 0 ? (
                  <Badge content={pendingCount} shape="circle" color="danger">
                    {route.icon}
                  </Badge>
                ) : (
                  route.icon
                )}
                {route.name}
              </Button>
            </NextLink>
          </NavbarItem>
        ))}
        <NavbarItem>
          <Button color="danger" onPress={handleLogout}>
            Logout
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Theme Toggle */}
      <NavbarContent justify="end">
        <ThemeSwitch className="text-white" />
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="bg-primary text-white">
        {adminRoutes.map((route) => (
          <NavbarMenuItem key={route.path}>
            <NextLink
              href={route.path}
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 hover:bg-primary/80"
            >
              <Button
                fullWidth
                variant="light"
                className="text-white justify-start flex items-center gap-3"
              >
                {route.showBadge && pendingCount > 0 ? (
                  <Badge content={pendingCount} color="danger" shape="circle">
                    {route.icon}
                  </Badge>
                ) : (
                  route.icon
                )}
                {route.name}
              </Button>
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
