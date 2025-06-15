import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { IoClose } from "react-icons/io5";

interface FilterModalProps {
  activeFilter: string;
  setActiveFilter: (filter: string | null) => void;
  filters: Record<string, any>;
  setFilters: (filters: any) => void;
  categories: { id: number; name: string }[];
  onApplyFilters: (filters: Record<string, any>) => void;
  resetFilters: () => void;
  quickFilters: { key: string; label: string }[];
}

export default function FilterModal({
  activeFilter,
  setActiveFilter,
  filters,
  setFilters,
  categories,
  onApplyFilters,
  resetFilters,
  quickFilters,
}: FilterModalProps) {
  return (
    <Modal isOpen onOpenChange={() => setActiveFilter(null)} size="lg" scrollBehavior="inside">
      <ModalContent >
        {/* 🔥 Modal Header */}
        <ModalHeader className="border-b">
          {activeFilter === "sort_by"
            ? "Sort By"
            : activeFilter === "category"
            ? "Select Cuisine"
            : activeFilter === "offers"
            ? "Offers"
            : activeFilter === "service_type"
            ? "Service Type"
            : "Filters"}
        </ModalHeader>

        {/* 🔥 Modal Body */}
        <ModalBody className="p-4 space-y-6">
          {/* ✅ Service Type Section (All - Delivery - Pickup) */}
          {(activeFilter === "service_type" || activeFilter === "all") && (
            <div className="border-b pb-4">
              <h3 className="text-md font-bold mb-2">Service Type</h3>
              {["all", "delivery", "pickup"].map((option) => (
                <label key={option} className="flex items-center gap-2 py-2">
                  <input
                    type="radio"
                    name="service_type"
                    value={option}
                    checked={filters.service_type === option}
                    onChange={() => setFilters((prev: any) => ({ ...prev, service_type: option }))}
                    className="w-5 h-5 accent-primary"
                  />
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
              ))}
            </div>
          )}

          {/* ✅ Sort By Section */}
          {(activeFilter === "sort_by" || activeFilter === "all") && (
            <div className="border-b pb-4">
              <h3 className="text-md font-bold mb-2">Sort by</h3>
              {["relevance", "fast_delivery", "distance"].map((option) => (
                <label key={option} className="flex items-center gap-2 py-2">
                  <input
                    type="radio"
                    name="sort_by"
                    value={option}
                    checked={filters.sort_by === option}
                    onChange={() => setFilters((prev: any) => ({ ...prev, sort_by: option }))}
                    className="w-5 h-5 accent-primary"
                  />
                  {option.replace("_", " ")}
                </label>
              ))}
            </div>
          )}

          {/* ✅ Cuisines (Multi-Select Checkboxes) */}
          {(activeFilter === "category" || activeFilter === "all") && (
            <div className="border-b pb-4">
              <h3 className="text-md font-bold mb-2">Cuisines</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(({ id, name }) => (
                  <label
                    key={id}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all"
                    style={{
                      backgroundColor: filters.category.includes(id) ? "#007C3D" : "#fff",
                      color: filters.category.includes(id) ? "#fff" : "#2E2E2E",
                      border: "1px solid #D1D5DB",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="category"
                      value={id}
                      checked={filters.category.includes(id)}
                      onChange={() =>
                        setFilters((prev: any) => {
                          const updatedCategories = prev.category.includes(id)
                            ? prev.category.filter((catId: number) => catId !== id)
                            : [...prev.category, id];
                          return { ...prev, category: updatedCategories };
                        })
                      }
                      className="hidden"
                    />
                    {name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Quick Filters Section */}
          {(activeFilter === "offers" || activeFilter === "all") && (
            <div>
              <h3 className="text-md font-bold mb-2">Offers</h3>
              {quickFilters.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={() => setFilters((prev: any) => ({ ...prev, [key]: !prev[key] }))}
                    className="w-5 h-5 accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
        </ModalBody>

        {/* ✅ Modal Footer (Reset & Apply Buttons) */}
        <ModalFooter className="p-4 flex justify-between">
          <Button variant="light" className="text-primary font-semibold" onPress={resetFilters}>
            Clear All
          </Button>
          <Button
            className="bg-primary text-white px-6 py-2 rounded-full"
            onPress={() => {
              onApplyFilters(filters); // ✅ Apply filters
              setActiveFilter(null);   // ✅ Close modal
            }}
          >
            Apply Filters
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
