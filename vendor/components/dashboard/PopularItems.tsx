"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { DashboardService } from "@/services/dashboardService";

interface PopularItem {
  name: string;
  orders: string;
  revenue: string;
  trend: number;
  image: string;
}

export default function PopularItems() {
  const [items, setItems] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularItems() {
      const result = await DashboardService.getPopularItems();
      if (Array.isArray(result)) setItems(result);
      setLoading(false);
    }

    fetchPopularItems();
  }, []);

  return (
    <Card className="shadow-sm border h-full">
      <CardBody>
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-lg">Popular Items</h3>
          <a href="/menus" className="text-sm text-primary hover:underline">
            Manage Menu →
          </a>
        </div>
        <p className="text-sm text-gray-500 mb-4">This month’s most ordered items</p>

        {loading ? (
          <p className="text-sm text-gray-400">Loading popular items...</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <li key={index} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
              
                  <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image}`}                    alt={item.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.orders} orders • ₱{item.revenue}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    item.trend >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {item.trend >= 0
                    ? `↑ ${item.trend}%`
                    : `↓ ${Math.abs(item.trend)}%`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
