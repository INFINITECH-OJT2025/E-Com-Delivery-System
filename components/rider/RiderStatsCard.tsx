"use client";

import { IoWalletOutline, IoBicycleOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

interface StatsCardProps {
    title: string;
    value: string;
    icon: "earnings" | "active" | "completed";
}

export default function RiderStatsCard({ title, value, icon }: StatsCardProps) {
    const iconMap = {
        earnings: <IoWalletOutline className="text-primary text-3xl" />,
        active: <IoBicycleOutline className="text-yellow-500 text-3xl" />,
        completed: <IoCheckmarkCircleOutline className="text-green-500 text-3xl" />,
    };

    return (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <h3 className="text-xl font-bold">{value}</h3>
            </div>
            {iconMap[icon]}
        </div>
    );
}
