"use client";

import { Button } from "@heroui/react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image: string;
  menu_category_id: number;
}

interface MenuListProps {
  items: MenuItem[];
  onEdit: (menu: MenuItem) => void;
  onDelete: (id: number) => void;
}

export default function MenuList({ items, onEdit, onDelete }: MenuListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 col-span-full py-10">
        No menu items found.
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-md border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2 font-semibold text-gray-700">Item</th>
            <th className="px-4 py-2 font-semibold text-gray-700">Description</th>
            <th className="px-4 py-2 font-semibold text-gray-700">Price</th>
            <th className="px-4 py-2 font-semibold text-gray-700">Stock</th>
            <th className="px-4 py-2 font-semibold text-gray-700 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((menu) => (
            <tr key={menu.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3 flex items-center gap-3">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${menu.image}`}
                  alt={menu.name}
                  className="h-12 w-12 object-contain rounded bg-gray-100"
                />
                <span className="font-medium text-gray-800">{menu.name}</span>
              </td>
              <td className="px-4 py-3 text-gray-600">{menu.description}</td>
              <td className="px-4 py-3 font-semibold text-primary">₱{menu.price}</td>
              <td className="px-4 py-3">
                <span className="bg-gray-200 rounded-full px-3 py-1 text-sm text-gray-700">
                  {menu.stock}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <Button size="sm" color="warning" onPress={() => onEdit(menu)}>
                    <FaEdit />
                  </Button>
                  <Button size="sm" color="danger" onPress={() => onDelete(menu.id)}>
                    <FaTrash />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
