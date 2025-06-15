"use client";

import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Textarea, Button, Select, SelectItem, Spinner
} from "@heroui/react";
import { useEffect, useState } from "react";
import { addToast } from "@heroui/toast";
import { menuService } from "@/services/menuService";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image: string;
  menu_category_id: number;
}

interface MenuFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editMode: boolean;
  initialData: MenuItem | null;
  categories: Array<{ id: number; name: string }>;
  selectedCategory?: string; // ✅ NEW
}


export default function MenuFormModal({
  open,
  onClose,
  onSuccess,
  editMode,
  initialData,
  categories,
  selectedCategory,
}: MenuFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: null as File | null,
    menu_category_id: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        price: initialData.price,
        stock: initialData.stock.toString(),
        image: null,
        menu_category_id: initialData.menu_category_id.toString(),
      });
      setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/storage/${initialData.image}`);
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: null,
        menu_category_id: selectedCategory || "", // ✅ auto-preselect category
      });
      setImagePreview(null);
    }
  }, [editMode, initialData, selectedCategory, open]);
  
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) form.append(key, value as string | Blob);
    });

    const response = editMode
      ? await menuService.updateMenu(initialData!.id, form)
      : await menuService.createMenu(form);

    if (response.success !== false) {
      addToast({
        title: "Success",
        description: editMode ? "Menu updated!" : "Menu added!",
        color: "success",
      });
      onSuccess();
    } else {
      addToast({ title: "Error", description: "Something went wrong", color: "danger" });
    }

    setLoading(false);
  };

  return (
    <Modal isOpen={open} onClose={onClose} size="lg">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>{editMode ? "Edit Menu Item" : "Add Menu Item"}</ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              isRequired
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              isRequired
            />
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                label="Price (₱)"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                isRequired
              />
              <Input
                label="Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                isRequired
              />
            </div>
            <Select
  label="Category"
  placeholder="Select Category"
  selectedKeys={new Set([formData.menu_category_id])}
  onSelectionChange={(keys) => {
    const selected = Array.from(keys)[0] || "";
    handleChange("menu_category_id", String(selected));
  }}
  isRequired
>
  {categories.map((cat) => (
    <SelectItem key={cat.id}>
      {cat.name}
    </SelectItem>
  ))}
</Select>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 w-full max-h-52 object-contain bg-gray-50 rounded"
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" color="primary" isLoading={loading}>
              {editMode ? "Update" : "Add"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
