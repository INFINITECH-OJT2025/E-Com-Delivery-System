import { createContext, useContext, useEffect, useState } from "react";
import { VendorAuthService } from "../services/vendorAuthService";

interface VendorAuthContextType {
  success?: boolean;
  vendor: any;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}
type VendorUser = {
  id: number;
  name: string;
  email: string;
  // Add more fields as needed from your vendor user object
};

type VendorLoginResponse = {
  status: "success" | "error";
  message?: string;
  data?: {
    access_token: string;
    user: VendorUser;
  };
};

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

  const login = async (email: string, password: string): Promise<VendorLoginResponse> => {
    const response = await VendorAuthService.login(email, password);
  
    if (response.status === "success" && response.data) {
      const { access_token, user } = response.data;
  
      setVendor(user); // Set vendor context
      localStorage.setItem("vendor", JSON.stringify(user));
      localStorage.setItem("vendorToken", access_token);
    }
  
    return response;
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
