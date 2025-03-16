"use client";

import { useEffect, useState } from "react";
import { menuService } from "@/services/menuService";
import { categoryService } from "@/services/categoryService";
import {
  Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Textarea, Select, SelectItem, Spinner
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import Image from "next/image";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: null,
    menu_category_id: "",
  });

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    const response = await menuService.fetchMenu();
    if (response.success !== false) {
      setMenuItems(response);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const response = await categoryService.fetchMenuCategories();
    if (response.success !== false) {
      setCategories(response.data.categories);
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value as string);
    });

    let response;
    if (editMode) {
      response = await menuService.updateMenu(selectedMenu.id, form);
    } else {
      response = await menuService.createMenu(form);
    }

    if (response.success !== false) {
      addToast({ title: "Success", description: editMode ? "Menu updated!" : "Menu added!", color: "success" });
      fetchMenu();
      setModalOpen(false);
    } else {
      addToast({ title: "Error", description: "Something went wrong", color: "danger" });
    }

    setLoading(false);
  };

  const handleEdit = (menu: any) => {
    setEditMode(true);
    setSelectedMenu(menu);
    setFormData({
      name: menu.name,
      description: menu.description,
      price: menu.price,
      stock: menu.stock,
      image: null,
      menu_category_id: menu.menu_category_id,
    });
    setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/storage/${menu.image}`);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setLoading(true);
      const response = await menuService.deleteMenu(id);
      if (response.success !== false) {
        addToast({ title: "Deleted", description: "Menu item removed", color: "danger" });
        fetchMenu();
      }
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Manage Menu</h1>

      <div className="flex justify-end mb-4">
        <Button
          color="primary"
          onPress={() => {
            setEditMode(false);
            setFormData({ name: "", description: "", price: "", stock: "", image: null, menu_category_id: "" });
            setImagePreview(null);
            setModalOpen(true);
          }}
        >
          <FaPlus className="mr-2" /> Add Menu Item
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((menu: any) => (
            <Card key={menu.id} className="shadow-lg">
              <CardBody>
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${menu.image}`} alt={menu.name} className="w-full h-40 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-semibold">{menu.name}</h3>
                <p className="text-gray-500">{menu.description}</p>
                <p className="text-lg font-bold">₱{menu.price}</p>
                <p className={`text-sm ${menu.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                  {menu.stock > 0 ? "In Stock" : "Out of Stock"}
                </p>

                <div className="flex justify-between mt-4">
                  <Button color="warning" onPress={() => handleEdit(menu)}>
                    <FaEdit className="mr-2" /> Edit
                  </Button>
                  <Button color="danger" onPress={() => handleDelete(menu.id)}>
                    <FaTrash className="mr-2" /> Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* ✅ Modal */}
      <Modal isOpen={modalOpen} onOpenChange={setModalOpen} size="lg">
        <ModalContent>
          <ModalHeader>{editMode ? "Edit Menu" : "Add Menu"}</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Input label="Name" name="name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
              <Textarea label="Description" name="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
              <Input label="Price" name="price" type="number" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} required />
              <Input label="Stock" name="stock" type="number" value={formData.stock} onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))} required />

              <Select label="Category" name="menu_category_id" value={formData.menu_category_id} onChange={(e) => setFormData((prev) => ({ ...prev, menu_category_id: e.target.value }))}>
                {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
              </Select>

              <Input label="Image" type="file" accept="image" name="image" onChange={handleFileChange} />
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-md" />}

              <Button type="submit" color="primary">{editMode ? "Update Menu" : "Add Menu"}</Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
