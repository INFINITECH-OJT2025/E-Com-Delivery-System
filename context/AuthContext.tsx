import { createContext, useContext, useEffect, useState } from "react";
import { VendorAuthService } from "../services/vendorAuthService";

interface VendorAuthContextType {
  vendor: any;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const VendorAuthContext = createContext<VendorAuthContextType | null>(null);

export const VendorAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    // Get vendor from localStorage immediately when the app starts
    const storedVendor = localStorage.getItem("vendor");
    if (storedVendor) {
      setVendor(JSON.parse(storedVendor));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await VendorAuthService.login(email, password);
    if (data.success) {
      setVendor(data.user); // Store the vendor data immediately after login
      // Optionally store vendor data in localStorage
      localStorage.setItem("vendor", JSON.stringify(data.user));
      localStorage.setItem("vendorToken", data.access_token);
    }
    return data;
  };

  const register = async (data: any) => {
    await VendorAuthService.register(data);
  };

  const logout = async () => {
    await VendorAuthService.logout();
    setVendor(null); // Clear vendor state after logout
    // Clear vendor and token from localStorage
    localStorage.removeItem("vendor");
    localStorage.removeItem("vendorToken");
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
