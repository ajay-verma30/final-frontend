import React from "react";

interface Category {
  id?: number;
  name: string;
}

interface ShopSidebarProps {
  categories?: Category[];
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { name: "T-Shirts" },
  { name: "Hoodies" },
  { name: "Accessories" },
];

const ShopSidebar: React.FC<ShopSidebarProps> = ({
  categories = DEFAULT_CATEGORIES,
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <aside className="w-64 flex-shrink-0 space-y-8">
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id ?? cat.name}
              onClick={() => onCategorySelect?.(cat.name)}
              className={`w-full text-left p-3 rounded-xl font-bold transition-all flex items-center justify-between group
                ${selectedCategory === cat.name
                  ? "bg-indigo-50 text-indigo-600"
                  : "hover:bg-white text-slate-600 hover:text-indigo-600"
                }`}
            >
              {cat.name}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ShopSidebar;