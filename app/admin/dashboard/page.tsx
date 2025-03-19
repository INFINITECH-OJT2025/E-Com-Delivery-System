"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { FaStore, FaUsers, FaMotorcycle, FaShoppingCart } from "react-icons/fa";
import { Button } from "@heroui/react";
import Link from "next/link";
import { adminService } from "@/services/adminService";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ restaurants: 0, users: 0, riders: 0, activeOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // ✅ Fetch all dashboard data in parallel
    const [statsRes, ordersRes, registrationsRes] = await Promise.all([
      adminService.fetchDashboardStats(),
      adminService.fetchRecentOrders(),
      adminService.fetchRecentRegistrations(),
    ]);

    // ✅ Set state if response is successful
    if (statsRes.status === "success") setStats(statsRes.data);
    if (ordersRes.status === "success") setRecentOrders(ordersRes.data);
    if (registrationsRes.status === "success") setRecentRegistrations(registrationsRes.data);

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* ✅ Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Restaurants", count: stats.restaurants, icon: <FaStore className="text-blue-500 w-8 h-8" /> },
          { label: "Total Users", count: stats.users, icon: <FaUsers className="text-green-500 w-8 h-8" /> },
          { label: "Total Riders", count: stats.riders, icon: <FaMotorcycle className="text-yellow-500 w-8 h-8" /> },
          { label: "Active Orders", count: stats.activeOrders, icon: <FaShoppingCart className="text-red-500 w-8 h-8" /> },
        ].map((stat, index) => (
          <Card key={index} className="shadow-md p-4 flex items-center space-x-4">
            {stat.icon}
            <div className="text-center mt-3">
              <h2 className="text-2xl font-bold">{loading ? "..." : stat.count}</h2>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ✅ Recent Orders */}
      <div className="mt-8">
        <Card className="shadow-md">
          <CardHeader className="text-lg font-bold">Recent Orders</CardHeader>
          <CardBody>
            <Table isStriped>
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>Customer</TableColumn>
                <TableColumn>Total</TableColumn>
                <TableColumn>Status</TableColumn>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>₱{order.total}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-white text-sm ${
                          order.status === "Pending" ? "bg-yellow-500" :
                          order.status === "Completed" ? "bg-green-500" : "bg-blue-500"
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center">No recent orders</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* ✅ Recent Registrations */}
      <div className="mt-8">
        <Card className="shadow-md">
          <CardHeader className="text-lg font-bold">Recent Registrations</CardHeader>
          <CardBody>
            <Table isStriped>
              <TableHeader>
                <TableColumn>Name</TableColumn>
                <TableColumn>Type</TableColumn>
                <TableColumn>Date Registered</TableColumn>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                ) : recentRegistrations.length > 0 ? (
                  recentRegistrations.map((reg, index) => (
                    <TableRow key={index}>
                      <TableCell>{reg.name}</TableCell>
                      <TableCell>{reg.type}</TableCell>
                      <TableCell>{reg.date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={3} className="text-center">No recent registrations</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
