import { createContext, useContext, useEffect, useState } from "react";
import { RiderAuthService } from "../services/riderAuthService";

interface RiderAuthContextType {
  rider: any;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const RiderAuthContext = createContext<RiderAuthContextType | null>(null);

export const RiderAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [rider, setRider] = useState<any>(null);

  useEffect(() => {
    // Get rider from localStorage immediately when the app starts
    const storedRider = localStorage.getItem("rider");
    if (storedRider) {
      setRider(JSON.parse(storedRider));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await RiderAuthService.login(email, password);
    if (data.success) {
      setRider(data.user); // Store the rider data immediately after login
      // Optionally store rider data in localStorage
      localStorage.setItem("rider", JSON.stringify(data.user));
      localStorage.setItem("riderToken", data.access_token);
    }
    return data;
  };

  const register = async (data: any) => {
    await RiderAuthService.register(data);
  };

  const logout = async () => {
    await RiderAuthService.logout();
    setRider(null); // Clear rider state after logout
    // Clear rider and token from localStorage
    localStorage.removeItem("rider");
    localStorage.removeItem("riderToken");
  };

  return (
    <RiderAuthContext.Provider value={{ rider, login, register, logout }}>
      {children}
    </RiderAuthContext.Provider>
  );
};

export const useRiderAuth = () => {
  const context = useContext(RiderAuthContext);
  if (!context) throw new Error("useRiderAuth must be used within RiderAuthProvider");
  return context;
};
