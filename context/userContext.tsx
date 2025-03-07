"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { userService } from "@/services/userService";
import { addressService } from "@/services/addressService";
import { googleMapsService } from "@/services/googleMapsService";

interface Address {
    id?: number;
    label?: string;
    address: string;
    latitude: number;
    longitude: number;
    is_default?: boolean;
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
    selectedAddress: Address | null;
    fetchUser: () => Promise<void>;
    updateProfile: (data: { name?: string; phone_number?: string }) => Promise<{ success: boolean; message?: string }>;
    addAddress: (data: Omit<Address, "id">) => Promise<{ success: boolean; message?: string }>;
    setDefaultAddress: (address_id: number) => Promise<{ success: boolean; message?: string }>;
    setSelectedAddress: (address: Address | null) => void;
    deleteAddress: (address_id: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

    /**
     * ✅ Fetch user data and set the last used or default address
     */
    const fetchUser = async () => {
        try {
            const response = await userService.fetchUser();
            if (response.success && response.data) {
                setUser(response.data);

                // ✅ Load last used address from localStorage
                const lastSavedAddress = localStorage.getItem("selected_address");
                const parsedAddress: Address | null = lastSavedAddress ? JSON.parse(lastSavedAddress) : null;

                if (parsedAddress) {
                    setSelectedAddress(parsedAddress);
                } else {
                    setSelectedAddress(response.data.default_address || response.data.addresses[0] || null);
                }
            }
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    /**
     * ✅ Handle address selection & cache it
     */
    const handleAddressChange = (address: Address | null) => {
        setSelectedAddress(address);
        if (address) {
            localStorage.setItem("selected_address", JSON.stringify(address));
        } else {
            localStorage.removeItem("selected_address");
        }
    };

    /**
     * ✅ Fetch the user's current location only if no selected address is found
     */
    useEffect(() => {
        const fetchLocation = async () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        const address = await googleMapsService.getAddressFromCoords(latitude, longitude);

                        if (address && !selectedAddress) {
                            handleAddressChange({ address, latitude, longitude });
                        }
                    },
                    () => console.warn("Geolocation permission denied")
                );
            }
        };

        // ✅ Use cached address if available, otherwise fetch GPS
        const storedAddress = localStorage.getItem("selected_address");
        if (storedAddress) {
            setSelectedAddress(JSON.parse(storedAddress));
        } else {
            fetchLocation();
        }

        fetchUser();
    }, []);

    /**
     * ✅ Update User Profile
     */
    const updateProfile = async (data: { name?: string; phone_number?: string }) => {
        const response = await userService.updateProfile(data);
        if (response.success) {
            await fetchUser();
        }
        return response;
    };

    /**
     * ✅ Add Address & Update Local State
     */
    const addAddress = async (data: Omit<Address, "id">) => {
        const response = await addressService.addAddress(data);
        if (response.success) {
            await fetchUser();
            handleAddressChange(response.data); // ✅ Set newly added address as selected
        }
        return response;
    };

    /**
     * ✅ Set Default Address & Update Local State
     */
    const setDefaultAddress = async (address_id: number) => {
        const response = await addressService.setDefaultAddress(address_id);
        if (response.success) {
            setUser((prevUser) => {
                if (!prevUser) return prevUser;

                const updatedAddresses = prevUser.addresses.map((addr) =>
                    addr.id === address_id ? { ...addr, is_default: true } : { ...addr, is_default: false }
                );

                const newDefault = updatedAddresses.find((addr) => addr.is_default) || prevUser.default_address;
                setSelectedAddress(newDefault); // ✅ Update `selectedAddress`
                localStorage.setItem("selected_address", JSON.stringify(newDefault)); // ✅ Update localStorage

                return {
                    ...prevUser,
                    addresses: updatedAddresses,
                    default_address: newDefault,
                };
            });
        }
        return response;
    };

    /**
     * ✅ Delete Address & Update Local State
     */
    const deleteAddress = async (address_id: number) => {
        const response = await addressService.deleteAddress(address_id);
        if (response.success) {
            setUser((prevUser) => {
                if (!prevUser) return prevUser;

                const updatedAddresses = prevUser.addresses.filter((addr) => addr.id !== address_id);

                // ✅ If the deleted address was the selected one, reset it
                if (selectedAddress?.id === address_id) {
                    handleAddressChange(updatedAddresses[0] || null);
                }

                return {
                    ...prevUser,
                    addresses: updatedAddresses,
                    default_address: updatedAddresses.find((addr) => addr.is_default) || null,
                };
            });
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                selectedAddress,
                fetchUser,
                updateProfile,
                addAddress,
                setDefaultAddress,
                setSelectedAddress: handleAddressChange,
                deleteAddress,
            }}
        >
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
