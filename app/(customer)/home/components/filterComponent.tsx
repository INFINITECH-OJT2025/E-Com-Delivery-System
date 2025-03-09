"use client";

import { useState, useMemo } from "react";
import { IoFilterOutline, IoChevronDown } from "react-icons/io5";
import { Button } from "@heroui/react";
import FilterModal from "./FilterModal";

interface FilterProps {
  selectedFilters?: Record<string, any>; // ✅ Defaulted to empty object
  categories: { id: number; name: string }[];
  onApplyFilters: (filters: Record<string, any>) => void;
}

export default function FilterComponent({
  selectedFilters = {}, // ✅ Prevents undefined errors
  categories,
  onApplyFilters,
}: FilterProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    sort_by: selectedFilters?.sort_by || "relevance",
    category: selectedFilters?.category || [],
    free_delivery: selectedFilters?.free_delivery || false,
    accepts_vouchers: selectedFilters?.accepts_vouchers || false,
    deal: selectedFilters?.deal || false,
    rating_4_plus: selectedFilters?.rating_4_plus || false,
  });

  // 🔥 Memoized Quick Filters
  const quickFilters = useMemo(
    () => [
      { key: "free_delivery", label: "Free Delivery" },
      { key: "accepts_vouchers", label: "Accepts Vouchers" },
      { key: "deal", label: "Special Deals" },
      { key: "rating_4_plus", label: "Ratings 4.0+" },
    ],
    []
  );

  // 🔥 Calculate Active Filters Count
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value && value !== "relevance" && value.length !== 0).length;
  }, [filters]);

  // 🔥 Selected Categories Display
  const selectedCategories = useMemo(() => {
    if (!filters.category.length) return "Cuisines";
    const selectedNames = categories
      .filter(({ id }) => filters.category.includes(id))
      .map(({ name }) => name)
      .join(", ");
    return selectedNames.length > 20 ? selectedNames.substring(0, 20) + "..." : selectedNames; // Limit text length
  }, [filters.category, categories]);

  // 🔄 Reset Filters
  const resetFilters = () => {
    setFilters({
      sort_by: "relevance",
      category: [],
      free_delivery: false,
      accepts_vouchers: false,
      deal: false,
      rating_4_plus: false,
    });
  };

  return (
    <>
      {/* 🔥 Horizontally Scrollable Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-3 bg-white shadow-md whitespace-nowrap no-scrollbar w-full">
        
        {/* 🛠️ Main Filter Icon (Round Button with Badge) */}
        <button
          onClick={() => setActiveFilter("all")}
          className="relative flex items-center justify-center w-12 h-12 min-w-[48px] rounded-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-200"
        >
          <IoFilterOutline size={22} />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* 🔥 Quick Access Buttons (Scrollable, No Forced Fitting) */}
   
          {/* 🔽 Sort By Button */}
          <Button
            onPress={() => setActiveFilter("sort_by")}
            className={`flex items-center justify-between px-4 py-2 min-w-[140px] rounded-full text-sm font-medium border border-gray-300 hover:bg-gray-200
              ${filters.sort_by === "relevance" ? "bg-white text-gray-800" : "bg-primary text-white"}`}
          >
            {filters.sort_by.replace("_", " ")}
            <IoChevronDown size={16} />
          </Button>

          {/* 🔽 Cuisines Button */}
          <Button
            onPress={() => setActiveFilter("category")}
            className={`flex items-center justify-between px-4 py-2 min-w-[140px] rounded-full text-sm font-medium border border-gray-300 hover:bg-gray-200
              ${filters.category.length === 0 ? "bg-white text-gray-800" : "bg-primary text-white"}`}
          >
            {selectedCategories}
            <IoChevronDown size={16} />
          </Button>

          {/* 🔽 Offers Button */}
          <Button
            onPress={() => setActiveFilter("offers")}
            className={`flex items-center justify-between px-4 py-2 min-w-[140px] rounded-full text-sm font-medium border border-gray-300 hover:bg-gray-200
              ${!filters.free_delivery && !filters.accepts_vouchers && !filters.deal && !filters.rating_4_plus ? "bg-white text-gray-800" : "bg-primary text-white"}`}
          >
            Offers
            <IoChevronDown size={16} />
          </Button>
        </div>
      

      {/* ✅ Filters Modal (Now Categorized with All Clickable Sections) */}
      {activeFilter && (
        <FilterModal
          activeFilter={activeFilter === "all" ? "all" : activeFilter} // Open all filters if "all" is clicked
          setActiveFilter={setActiveFilter}
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          onApplyFilters={onApplyFilters}
          resetFilters={resetFilters}
          quickFilters={quickFilters}
        />
      )}
    </>
  );
}
