"use client";

import { Input, Select, SelectItem } from "@heroui/react";

interface MenuFilterBarProps {
  categories: Array<{ id: number; name: string }>;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function MenuFilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: MenuFilterBarProps) {
  return (
    <div className="flex flex-1 gap-3">
      {/* Search input expands to available space */}
      <Input
        placeholder="Search menu items..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        startContent={<span className="text-gray-400">🔍</span>}
        className="w-full"
        size="sm"
        radius="md"
        variant="bordered"
      />

      {/* Select has fixed width */}
      <Select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-[160px]"
        placeholder="All Items"
        size="sm"
        radius="md"
        variant="bordered"
      >
        <SelectItem key="" value="">
          All Items
        </SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id.toString()}>
            {cat.name}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
