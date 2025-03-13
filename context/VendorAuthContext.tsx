"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { VendorAuthService } from "../services/vendorAuthService";
import { useRouter } from "next/navigation";

interface VendorAuthContextType {
  vendor: any;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const VendorAuthContext = createContext<VendorAuthContextType | null>(null);

export const VendorAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [vendor, setVendor] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchVendor() {
      const user = await VendorAuthService.getAuthenticatedUser();
      setVendor(user);
    }
    fetchVendor();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await VendorAuthService.login(email, password);
    localStorage.setItem("vendorToken", data.access_token);
    setVendor(data.user);
    router.push("/vendor/dashboard");
  };

  const register = async (data: any) => {
    await VendorAuthService.register(data);
    router.push("/vendor/login");
  };

  const logout = async () => {
    await VendorAuthService.logout();
    setVendor(null);
    router.push("/vendor/login");
  };

  return (
    <VendorAuthContext.Provider value={{ vendor, login, register, logout }}>
      {children}
    </VendorAuthContext.Provider>
  );
};

export const useVendorAuth = () => {
  const context = useContext(VendorAuthContext);
  if (!context) throw new Error("useVendorAuth must be used within VendorAuthProvider");
  return context;
};
