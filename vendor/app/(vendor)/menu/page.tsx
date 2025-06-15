"use client";

import { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Spinner,
  Button,
  Input,
  Select,
  SelectItem,
  Pagination,
} from "@heroui/react";
import { FaPlus } from "react-icons/fa";
import { Search } from "lucide-react";
import { addToast } from "@heroui/toast";

import { menuService } from "@/services/menuService";
import { categoryService } from "@/services/categoryService";
import MenuGrid from "@/components/Menu/MenuGrid";
import MenuList from "@/components/Menu/MenuList";
import MenuFormModal from "@/components/Menu/MenuFormModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [menuToDelete, setMenuToDelete] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tabKey, setTabKey] = useState("grid");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, itemsPerPage]);

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

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.menu_category_id === parseInt(selectedCategory)
      : true;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredMenuItems.length / itemsPerPage);
  const paginatedItems = filteredMenuItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddClick = () => {
    setEditMode(false);
    setSelectedMenu(null);
    setModalOpen(true);
  };

  const handleEdit = (menu: any) => {
    setSelectedMenu(menu);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setMenuToDelete(id);
    setDeleteModalOpen(true);
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
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Manage Menu</h1>

      {/* Filter + Button Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-1 gap-3">
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="text-gray-400" />}
            className="w-full"
            variant="bordered"
          />

          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-[200px]"
            placeholder="All Items"
            variant="bordered"
          >
            <SelectItem key="">All Items</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} >
                {cat.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        <Button color="primary" onPress={handleAddClick} className="w-full sm:w-auto">
          <FaPlus className="mr-2" /> Add Menu Item
        </Button>
      </div>

      {/* Tabs Header and Count */}
      <div className="flex items-center justify-between mb-2">
        <Tabs
          selectedKey={tabKey}
          onSelectionChange={(key) => setTabKey(key as string)}
          variant="solid"
          aria-label="View Mode"
        >
          <Tab key="grid" title="Grid View" />
          <Tab key="list" title="List View" />
        </Tabs>

        <span className="text-sm text-gray-500">
          Showing {filteredMenuItems.length} item{filteredMenuItems.length !== 1 && "s"}
        </span>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {loading ? (
        <div className="flex items-center justify-center ">
        <Spinner size="lg" />
      </div>
      
        ) : tabKey === "grid" ? (
          <MenuGrid items={paginatedItems} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <MenuList items={paginatedItems} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {/* Rows Per Page + Pagination */}
    
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="text-sm text-default-400">
            Rows per page:
            <select
              className="ml-2 bg-transparent outline-none text-default-500 text-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setCurrentPage(1);
                setItemsPerPage(parseInt(e.target.value));
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>

          <Pagination
            page={currentPage}
            total={totalPages}
            onChange={(page) => setCurrentPage(page)}
            variant="flat"
            showControls
            showShadow
            color="primary"
          />
        </div>
     

      {/* Modals */}
      <MenuFormModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  editMode={editMode}
  initialData={selectedMenu}
  categories={categories}
  selectedCategory={selectedCategory} // ✅ NEW PROP
  onSuccess={() => {
    setModalOpen(false);
    fetchMenu();
  }}
/>


      <DeleteConfirmModal
        open={deleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
