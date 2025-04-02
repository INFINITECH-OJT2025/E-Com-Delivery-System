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
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<number | null>(null);

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

  const [selectedCategory, setSelectedCategory] = useState(""); // To store selected category
  const [searchQuery, setSearchQuery] = useState(""); // To store search query

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

  const handleDelete = (id: number) => {
    setMenuToDelete(id); // Store the ID of the menu item to be deleted
    setDeleteModalOpen(true); // Open the delete confirmation modal
  };
  
  const confirmDelete = async () => {
    if (menuToDelete !== null) {
      setLoading(true);
      const response = await menuService.deleteMenu(menuToDelete);
      if (response.success !== false) {
        addToast({ title: "Deleted", description: "Menu item removed", color: "danger" });
        fetchMenu();
      }
      setLoading(false);
      setDeleteModalOpen(false); // Close the modal after deletion
    }
  };
  
  const cancelDelete = () => {
    setDeleteModalOpen(false); // Close the modal without deletion
  };

  const filteredMenuItems = menuItems.filter((item: any) => {
    const matchesCategory = selectedCategory ? item.menu_category_id === parseInt(selectedCategory) : true;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Manage Menu</h1>

      <div className="flex justify-between mb-4">
        {/* Category Filter */}
        <Select
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
  className="w-1/4"
  required
  placeholder="Select Category"
>
  <SelectItem key="" value="">All Categories</SelectItem>
  {categories.map((cat) => (
    <SelectItem key={cat.id} value={cat.id}>
      {cat.name}
    </SelectItem>
  ))}
</Select>


        {/* Search Bar */}
        <Input
          placeholder="Search Menu"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/4"
        />

        {/* Add Menu Button */}
        <Button
          color="primary"
          onPress={() => {
            setEditMode(false);
            setFormData({ name: "", description: "", price: "", stock: "", image: null, menu_category_id: "" });
            setImagePreview(null);
            setModalOpen(true);
          }}
          className="shadow-md"
        >
          <FaPlus className="mr-2" /> Add Menu Item
        </Button>
      </div>

      {loading ? (
  <div className="flex justify-center items-center h-40">
    <Spinner size="lg" />
  </div>
) : filteredMenuItems.length === 0 ? (
  <div className="text-center text-gray-500 col-span-full py-10">
    No menu items found {selectedCategory ? "in this category" : ""}.
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredMenuItems.map((menu: any) => (
      <Card key={menu.id} className="shadow-lg transition-transform hover:scale-105 hover:shadow-xl border border-gray-200">
        <CardBody className="p-4">
          <PhotoProvider>
            <PhotoView src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${menu.image}`}>
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${menu.image}`}
                alt={menu.name}
                className="w-full h-auto max-h-60 object-contain rounded-lg mb-4 cursor-pointer"
              />
            </PhotoView>
          </PhotoProvider>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-800">{menu.name}</h3>
            <p className="text-gray-500 text-sm">{menu.description}</p>
            <p className="text-lg font-semibold text-primary">₱{menu.price}</p>
            <span className={`text-sm font-medium ${menu.stock > 0 ? "text-green-600" : "text-red-500"}`}>
              {menu.stock > 0 ? `In Stock (${menu.stock})` : "Out of Stock"}
            </span>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button size="sm" color="warning" onPress={() => handleEdit(menu)}>
              <FaEdit className="mr-2" /> Edit
            </Button>
            <Button size="sm" color="danger" onPress={() => handleDelete(menu.id)}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Name" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <Input label="Price (₱)" name="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Stock" name="stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                <Select label="Category" placeholder="All Categories" name="menu_category_id" value={formData.menu_category_id} onChange={(e) => setFormData({ ...formData, menu_category_id: e.target.value })}>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <Textarea label="Description" name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

              <div>
                <label className="text-sm font-medium text-gray-700">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>

              {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg mt-2" />}

              <Button type="submit" color="primary" className="mt-4 self-end">
                {editMode ? "Update Menu" : "Add Menu"}
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>{/* Delete Confirmation Modal */}
<Modal isOpen={deleteModalOpen} onOpenChange={setDeleteModalOpen} size="sm">
  <ModalContent>
    <ModalHeader>Confirm Deletion</ModalHeader>
    <ModalBody>
      <p className="text-sm">Are you sure you want to delete this item?</p>
    </ModalBody>
    <ModalFooter>
      <Button color="secondary" onPress={cancelDelete} className="mr-2">
        Cancel
      </Button>
      <Button color="danger" onPress={confirmDelete}>
        Delete
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

    </div>
  );
}
