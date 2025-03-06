"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { userService } from "@/services/userService";
import { addressService } from "@/services/addressService";

interface Address {
    id: number;
    label: string;
    address: string;
    latitude: number;
    longitude: number;
    notes?: string;
    is_default: boolean;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
    addresses: Address[];
    default_address?: Address;
}

interface UserContextType {
    user: User | null;
    fetchUser: () => Promise<void>;
    updateProfile: (data: { name?: string; phone_number?: string }) => Promise<{ success: boolean; message?: string }>;
    addAddress: (data: Omit<Address, "id">) => Promise<{ success: boolean; message?: string }>;
    setDefaultAddress: (address_id: number) => Promise<{ success: boolean; message?: string }>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const fetchUser = async () => {
        try {
            const response = await userService.fetchUser();
            if (response.success && response.data) {
                setUser({
                    ...response.data,  // ✅ Ensure all user fields are set
                    addresses: response.data.addresses || [],  // ✅ Ensure addresses are included
                    default_address: response.data.addresses?.find(addr => addr.is_default) || null,  // ✅ Set the default address
                });
            } else {
                console.error("Failed to fetch user:", response.message);
            }
        } catch (error) {
            console.error("Unexpected error fetching user:", error);
        }
    };
    

    // ✅ Update User Profile
    const updateProfile = async (data: { name?: string; phone_number?: string }) => {
        const response = await userService.updateProfile(data);
        if (response.success) {
            await fetchUser(); // Refresh user data
        }
        return response;
    };

    // ✅ Add Address & Update Local State
    const addAddress = async (data: Omit<Address, "id">) => {
        const response = await addressService.addAddress(data);
        if (response.success) {
            await fetchUser(); // Ensure UI updates
        }
        return response;
    };

    // ✅ Set Default Address & Update Local State
    const setDefaultAddress = async (address_id: number) => {
        const response = await addressService.setDefaultAddress(address_id);
        if (response.success) {
            setUser((prevUser) => {
                if (!prevUser) return prevUser;

                const updatedAddresses = prevUser.addresses.map((addr) =>
                    addr.id === address_id ? { ...addr, is_default: true } : { ...addr, is_default: false }
                );

                return {
                    ...prevUser,
                    addresses: updatedAddresses,
                    default_address: updatedAddresses.find((addr) => addr.is_default) || prevUser.default_address,
                };
            });
        }
        return response;
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, fetchUser, updateProfile, addAddress, setDefaultAddress }}>
            {children}
        </UserContext.Provider>
    );
}

// ✅ Ensure Context is Not `null`
export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
