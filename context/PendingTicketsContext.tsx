"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchAllTickets } from "@/services/supportService";

interface PendingTicketsContextType {
  pendingCount: number;
  refreshPendingCount: () => void;
}

const PendingTicketsContext = createContext<PendingTicketsContextType | undefined>(undefined);

export const PendingTicketsProvider = ({ children }: { children: React.ReactNode }) => {
  const [pendingCount, setPendingCount] = useState<number>(0);

  // ✅ Memoized function to refresh pending tickets count
  const refreshPendingCount = useCallback(async () => {
    try {
      const response = await fetchAllTickets();
      if (response.success) {
        const pendingTickets = response.tickets.filter((ticket) => ticket.status === "Pending");
        setPendingCount(pendingTickets.length);
      }
    } catch (error) {
      console.error("Error fetching pending tickets:", error);
      setPendingCount(0);
    }
  }, []);

  // ✅ Runs once on mount, updates when refreshPendingCount changes
  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  return (
    <PendingTicketsContext.Provider value={{ pendingCount, refreshPendingCount }}>
      {children}
    </PendingTicketsContext.Provider>
  );
};

export const usePendingTickets = () => {
  const context = useContext(PendingTicketsContext);
  if (!context) {
    throw new Error("usePendingTickets must be used within a PendingTicketsProvider");
  }
  return context;
};
