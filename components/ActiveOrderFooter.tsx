"use client";

import { FaMotorcycle } from "react-icons/fa";
import { Button } from "@heroui/react";

interface ActiveOrderFooterProps {
    status: string;
    onClick: () => void;
}

const ActiveOrderFooter = ({ status, onClick }: ActiveOrderFooterProps) => {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 bg-primary text-white flex items-center justify-between px-4 py-2 shadow-md cursor-pointer z-50"
            onClick={onClick}
        >
            <div className="flex items-center gap-2 truncate">
                <FaMotorcycle className="text-xl" />
                <span className="truncate font-medium">{status}</span>
            </div>
            <Button size="sm" variant="flat" color="secondary">Track</Button>
        </div>
    );
};

export default ActiveOrderFooter;
