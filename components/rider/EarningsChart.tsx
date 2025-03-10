"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { day: "Mon", earnings: 50 },
    { day: "Tue", earnings: 75 },
    { day: "Wed", earnings: 60 },
    { day: "Thu", earnings: 90 },
    { day: "Fri", earnings: 120 },
    { day: "Sat", earnings: 200 },
    { day: "Sun", earnings: 180 },
];

export default function EarningsChart() {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-700 mb-3">Weekly Earnings</h3>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
