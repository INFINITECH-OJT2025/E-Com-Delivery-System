'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@heroui/react';
import NextLink from 'next/link';
import Image from 'next/image';
import { authService } from '@/services/authService';
import { ThemeSwitch } from '@/components/theme-switch';
import { usePendingTickets } from '@/context/PendingTicketsContext';
import { useAdminChat } from '@/context/AdminChatContext';

import { Users, Bike, Ticket, MessageCircle, LogIn, UserPlus } from 'lucide-react';

interface AdminRoute {
  name: string;
  path: string;
  icon: JSX.Element;
  showBadge?: boolean;
  badgeCount?: number;
}

export default function AdminNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const { pendingCount } = usePendingTickets();
  const { unreadCount } = useAdminChat();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    localStorage.removeItem('adminToken');
    router.push('/login');
  };

  const adminRoutes: AdminRoute[] = [
    { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Riders', path: '/admin/riders', icon: <Bike size={18} /> },
    {
      name: 'Tickets',
      path: '/admin/tickets',
      icon: <Ticket size={18} />,
      showBadge: pendingCount > 0,
      badgeCount: pendingCount,
    },
    {
      name: 'Support',
      path: '/admin/support',
      icon: <MessageCircle size={18} />,
      showBadge: unreadCount > 0,
      badgeCount: unreadCount,
    },
  ];

  const guestRoutes: AdminRoute[] = [
    { name: 'Login', path: '/login', icon: <LogIn size={18} /> },
    // { name: 'Register', path: '/register', icon: <UserPlus size={18} /> },
  ];

  const renderNavItem = (route: AdminRoute) => (
    <NextLink href={route.path} className="flex items-center" key={route.path}>
      <Button
        variant="light"
        className="text-white hover:bg-primary/80 flex items-center gap-2"
        isIconOnly={false}
      >
        {route.showBadge && route.badgeCount ? (
          <Badge content={route.badgeCount} shape="circle" color="danger">
            {route.icon}
          </Badge>
        ) : (
          route.icon
        )}
        {route.name}
      </Button>
    </NextLink>
  );

  const routesToShow = isLoggedIn ? adminRoutes : guestRoutes;

  return (
    <HeroUINavbar
      maxWidth="xl"
      position="sticky"
      className="bg-primary text-white"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* 🔹 Brand */}
      <NavbarContent>
        <NavbarMenuToggle className="md:hidden" />
        <NavbarBrand>
          <NextLink href="/" className="flex items-center gap-2">
            <Image
              src="/images/delivery-panda.png"
              alt="Logo"
              width={40}
              height={40}
              priority
            />
            <p className="font-bold text-lg">E-Com Admin Portal</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* 🔹 Desktop Menu */}
      <NavbarContent className="hidden md:flex" justify="end">
        {routesToShow.map((route) => (
          <NavbarItem key={route.path}>{renderNavItem(route)}</NavbarItem>
        ))}
        {isLoggedIn && (
          <NavbarItem>
            <Button color="danger" onPress={handleLogout}>
              Logout
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      {/* 🔹 Theme */}
  
      {/* 🔹 Mobile Menu */}
      <NavbarMenu className="bg-primary text-white">
        {routesToShow.map((route) => (
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
                {route.showBadge && route.badgeCount ? (
                  <Badge content={route.badgeCount} color="danger" shape="circle">
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
        {isLoggedIn && (
          <NavbarMenuItem>
            <Button color="danger" className="w-full mt-2" onPress={handleLogout}>
              Logout
            </Button>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </HeroUINavbar>
  );
}
