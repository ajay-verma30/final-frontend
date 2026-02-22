import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axiosInstance";
import ProductCard from "../shop/components/ProductCard";
import { ChevronDown, X } from "lucide-react";
import ShopNavbar from "./components/ShopNavbar";

interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  parent_segment: string;
  sub_category_id: number;
  sub_category_name: string;
  main_image: string | null;
}

// Static enum values from DB schema — no API call needed
const PARENT_SEGMENTS = ["APPAREL", "ACCESSORIES", "FOOTWEAR", "STATIONERY", "HEADWEAR", "BAGS"] as const;
type ParentSegment = typeof PARENT_SEGMENTS[number];

const SEGMENT_LABELS: Record<ParentSegment, string> = {
  APPAREL:     "Apparel",
  ACCESSORIES: "Accessories",
  FOOTWEAR:    "Footwear",
  STATIONERY:  "Stationery",
  HEADWEAR:    "Headwear",
  BAGS:        "Bags",
};

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<ParentSegment | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<ParentSegment | null>(null);

  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/public/public-products");
        const data: Product[] = res.data.data;
        setProducts(data);

        // Resolve URL params → IDs after data loads (for breadcrumb navigation)
        const catSlug = searchParams.get("category");
        const subSlug = searchParams.get("subcategory");

        if (catSlug) {
          const matched = data.find(
            (p) => (p.category_slug || p.category_name?.toLowerCase().replace(/\s+/g, "-")) === catSlug
          );
          if (matched) {
            setSelectedCategoryId(matched.category_id);
            if (matched.parent_segment) setSelectedSegment(matched.parent_segment as ParentSegment);
          }
        }
        if (subSlug) {
          const matched = data.find(
            (p) => p.sub_category_name?.toLowerCase().replace(/\s+/g, "-") === subSlug
          );
          if (matched) setSelectedSubCategoryId(matched.sub_category_id);
        }
      } catch (err) {
        console.error("Error loading shop data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Derived unique categories and subcategories from product list
  const categories = Array.from(
    new Map(
      products.map((p) => [
        p.category_id,
        { id: p.category_id, name: p.category_name, segment: p.parent_segment },
      ])
    ).values()
  );

  const subcategories = Array.from(
    new Map(
      products.map((p) => [
        p.sub_category_id,
        { id: p.sub_category_id, name: p.sub_category_name, category_id: p.category_id },
      ])
    ).values()
  );

  const categoriesForSegment = (seg: ParentSegment) =>
    categories.filter((c) => c.segment === seg);

  // Filter logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = !selectedSegment || p.parent_segment === selectedSegment;
    const matchesCategory = !selectedCategoryId || p.category_id === selectedCategoryId;
    const matchesSub = !selectedSubCategoryId || p.sub_category_id === selectedSubCategoryId;
    return matchesSearch && matchesSegment && matchesCategory && matchesSub;
  });

  const handleSegmentClick = (seg: ParentSegment) => {
    setOpenDropdown((prev) => (prev === seg ? null : seg));
  };

  const handleCategorySelect = (seg: ParentSegment, catId: number | null) => {
    setSelectedSegment(seg);
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId(null);
    setOpenDropdown(null);
  };

  const clearAll = () => {
    setSelectedSegment(null);
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setOpenDropdown(null);
  };

  const activeLabel = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)?.name
    : selectedSegment
    ? SEGMENT_LABELS[selectedSegment]
    : null;

  // Only show sidebar when a category is selected and it has subcategories
  const sidebarSubs = selectedCategoryId
    ? subcategories.filter((s) => s.category_id === selectedCategoryId)
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopNavbar
        cartCount={0}
        onSearch={setSearchQuery}
        onLoginClick={() => (window.location.href = "/login")}
      />

      {/* ── Segment nav bar ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="flex items-center" ref={navRef}>

            {/* All */}
            <button
              onClick={clearAll}
              className={`px-5 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${
                !selectedSegment
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              All
            </button>

            {/* Segment tabs */}
            {PARENT_SEGMENTS.map((seg) => {
              const cats = categoriesForSegment(seg);
              const isActive = selectedSegment === seg;
              const isOpen = openDropdown === seg;

              return (
                <div key={seg} className="relative">
                  <button
                    onClick={() => handleSegmentClick(seg)}
                    className={`flex items-center gap-1.5 px-5 py-4 text-sm font-bold tracking-wide transition-all border-b-2 whitespace-nowrap ${
                      isActive
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    {SEGMENT_LABELS[seg]}
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {isOpen && (
                    <div className="absolute top-full left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl min-w-[200px] py-2 mt-px">
                      {/* All in segment */}
                      <button
                        onClick={() => handleCategorySelect(seg, null)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                          isActive && !selectedCategoryId
                            ? "text-indigo-600 bg-indigo-50"
                            : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        }`}
                      >
                        All {SEGMENT_LABELS[seg]}
                      </button>

                      {cats.length > 0 && (
                        <>
                          <div className="mx-4 my-1 border-t border-slate-100" />
                          {cats.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => handleCategorySelect(seg, cat.id)}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                selectedCategoryId === cat.id
                                  ? "text-indigo-600 bg-indigo-50 font-semibold"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                              }`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </>
                      )}

                      {cats.length === 0 && !loading && (
                        <p className="px-4 py-2.5 text-xs text-slate-400 italic">No categories yet</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Active filter indicator */}
            {activeLabel && (
              <div className="ml-auto flex items-center gap-2 pl-4">
                <span className="text-xs text-slate-400">
                  Showing:{" "}
                  <span className="font-semibold text-slate-700">{activeLabel}</span>
                </span>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X size={12} /> Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-screen-xl mx-auto px-8 py-10 flex gap-10">

        {/* Subcategory sidebar — only visible when a category is selected and has subs */}
        {sidebarSubs.length > 0 && (
          <aside className="w-52 flex-shrink-0">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              {categories.find((c) => c.id === selectedCategoryId)?.name}
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedSubCategoryId(null)}
                className={`w-full text-left py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                  !selectedSubCategoryId
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                }`}
              >
                All
              </button>
              {sidebarSubs.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() =>
                    setSelectedSubCategoryId((prev) => (prev === sub.id ? null : sub.id))
                  }
                  className={`w-full text-left py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                    selectedSubCategoryId === sub.id
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Product grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-4xl font-black text-slate-900">{activeLabel ?? "Discover"}</h2>
              <p className="text-slate-500 font-medium italic">{filteredProducts.length} items found</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-[4/5] bg-slate-200 animate-pulse rounded-3xl" />
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No products found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;