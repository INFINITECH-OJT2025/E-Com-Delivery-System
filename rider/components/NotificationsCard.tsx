"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { FaBell } from "react-icons/fa";

export default function NotificationsCard({ notifications }: { notifications: any[] }) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <h3 className="flex items-center gap-2 font-semibold">
          <FaBell size={18} /> Notifications
        </h3>
      </CardHeader>
      <Divider />
      <CardBody>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center">No new notifications</p>
        ) : (
          notifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className="border-b py-2 last:border-none">
              <p className="text-gray-700">{notification.message}</p>
              <p className="text-xs text-gray-400">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
