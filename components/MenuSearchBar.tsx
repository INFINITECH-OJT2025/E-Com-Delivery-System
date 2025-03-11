"use client";

import { useState, useEffect, useMemo } from "react";
import { IoSearch, IoCloseOutline } from "react-icons/io5";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { Input, Button } from "@heroui/react";
import MenuItem from "./MenuItem"; // ✅ Reuse Existing MenuItem Component

interface MenuSearchBarProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: any[]; // ✅ Pass all menu items here
}

export default function MenuSearchBar({ isOpen, onClose, menuItems }: MenuSearchBarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // ✅ Filter Menu Items Based on Search Query
    const filteredResults = useMemo(() => {
        if (!searchQuery.trim()) return menuItems; // Show all items when no search
        return menuItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, menuItems]);

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="full" hideCloseButton={true}>
            <ModalContent>
                {/* ✅ Modal Header (Contains Search Bar) */}
                <ModalHeader className="p-4 border-b">
                <div className="flex items-center gap-3 w-full">
                    <IoSearch className="text-gray-500 text-xl" />
                    <Input
                         type="text"
                         placeholder="Search in menu..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full bg-transparent px-3 py-1 focus:outline-none text-lg"
                        size="md"
                    />
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                    <IoCloseOutline className="text-2xl" />
                </button>
                </div>
                </ModalHeader>

                {/* ✅ Modal Body (List of Filtered Menu Items) */}
                <ModalBody className="p-4 overflow-y-auto h-[calc(100vh-60px)]">
                    {filteredResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredResults.map((menuItem) => (
                                <MenuItem key={menuItem.id} menuItem={menuItem} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center mt-4">
                            No matching menu items found.
                        </div>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
