"use client";

import { useState } from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image: string;
  category_name?: string;
  menu_category_id: number;
}

interface MenuGridProps {
  items: MenuItem[];
  onEdit: (menu: MenuItem) => void;
  onDelete: (id: number) => void;
}

export default function MenuGrid({ items, onEdit, onDelete }: MenuGridProps) {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 col-span-full py-10">
        No menu items found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((menu) => {
        const isExpanded = expandedItems.includes(menu.id);

        // Trim description to remove unwanted whitespace/newlines
        const trimmedDescription = menu.description.trim();

        // Show toggle only if trimmed description exceeds 180 characters
        const shouldRenderToggle = trimmedDescription.length > 180;

        return (
          <Card
            key={menu.id}
            className="shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl border border-gray-200 h-full flex flex-col"
          >
            {/* Image on top */}
            <PhotoProvider>
              <PhotoView
                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${menu.image}`}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${menu.image}`}
                  alt={menu.name}
                  className="w-full h-auto max-h-48 object-contain rounded-t-lg cursor-pointer bg-gray-50"
                />
              </PhotoView>
            </PhotoProvider>

            <CardBody className="p-4 flex flex-col h-full">
              {/* Top section: Name (left) and Price in Chip (right) */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-800">{menu.name}</h3>
                <Chip color="success" variant="flat" className="px-3 py-1">
                  ₱{menu.price}
                </Chip>
              </div>

              {/* Category beneath name */}
              {menu.category_name && (
                <Chip size="sm" variant="dot" className="mb-2">
                  {menu.category_name}
                </Chip>
              )}

              {/* Description with "See more"/"See less" */}
              <div className="flex-1">
                <p
                  className={`text-sm text-gray-600 whitespace-pre-wrap transition-all duration-200 ease-in-out ${
                    isExpanded ? "" : "line-clamp-3"
                  }`}
                >
                  {trimmedDescription}
                </p>

                {shouldRenderToggle && (
                  <button
                    onClick={() => toggleExpand(menu.id)}
                    className="text-primary mt-1 text-xs underline"
                  >
                    {isExpanded ? "See less" : "See more"}
                  </button>
                )}
              </div>

              {/* Stock status */}
              <span
                className={`text-sm font-medium ${
                  shouldRenderToggle ? "mt-2" : ""
                } ${menu.stock > 0 ? "text-green-600" : "text-red-500"}`}
              >
                {menu.stock > 0 ? `In Stock (${menu.stock})` : "Out of Stock"}
              </span>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <Button size="sm" color="warning" onPress={() => onEdit(menu)}>
                  <FaEdit className="mr-2" /> Edit
                </Button>
                <Button size="sm" color="danger" onPress={() => onDelete(menu.id)}>
                  <FaTrash className="mr-2" /> Delete
                </Button>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
