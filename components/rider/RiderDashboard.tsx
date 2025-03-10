"use client";

import { useState, useEffect } from "react";
import RiderStatsCard from "./RiderStatsCard";
import EarningsChart from "./EarningsChart";
import { Button } from "@heroui/react";

export default function RiderDashboard() {
    const [stats, setStats] = useState({
        earnings: "₱5,120",
        activeDeliveries: 3,
        completedDeliveries: 120,
    });

    useEffect(() => {
        // 🚀 Fetch rider stats from API
        async function fetchStats() {
            try {
                const response = await fetch("/api/rider/stats");
                const data = await response.json();
                if (data.success) {
                    setStats({
                        earnings: `₱${data.data.earnings}`,
                        activeDeliveries: data.data.active_deliveries,
                        completedDeliveries: data.data.completed_deliveries,
                    });
                }
            } catch (error) {
                console.error("Error fetching rider stats:", error);
            }
        }

        fetchStats();
    }, []);

    return (
        <div className="p-4">
            {/* 🚀 Rider Earnings & Deliveries Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RiderStatsCard title="Total Earnings" value={stats.earnings} icon="earnings" />
                <RiderStatsCard title="Active Deliveries" value={String(stats.activeDeliveries)} icon="active" />
                <RiderStatsCard title="Completed Deliveries" value={String(stats.completedDeliveries)} icon="completed" />
            </div>

            {/* 📊 Earnings Chart */}
            <div className="mt-6">
                <EarningsChart />
            </div>

            {/* 🚴‍♂️ View Available Deliveries */}
            <div className="mt-6 flex justify-center">
                <Button className="bg-primary text-white px-6 py-3 rounded-lg text-lg">
                    View Available Deliveries
                </Button>
            </div>
        </div>
    );
}
