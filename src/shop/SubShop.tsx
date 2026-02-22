import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ChevronDown, ChevronRight, X, ShoppingBag, Search } from "lucide-react";
import ShopNavbar from "./components/ShopNavbar";
import api from "../api/axiosInstance";

interface Category {
  id: number;
  slug: string;
  name?: string;
}

interface Subcategory {
  id: number;
  category_id: number;
  slug: string;
  name?: string;
}

interface ProductCard {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  gender: string;
  category: { id: number; slug: string };
  subcategory: { id: number; slug: string };
  product_images: { id: number; image_url: string; is_primary: number }[];
}

const GENDER_OPTIONS = ["All", "Men", "Women", "Unisex"];

export default function SubShop() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<ProductCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Active filters from URL params
  const activeCategory = searchParams.get("category") || "";
  const activeSubcategory = searchParams.get("subcategory") || "";
  const activeGender = searchParams.get("gender") || "All";

  // Fetch categories + subcategories once
  useEffect(() => {
    Promise.all([
      api.get("/api/public/categories").catch(() => ({ data: { data: [] } })),
      api.get("/api/public/subcategories").catch(() => ({ data: { data: [] } })),
    ]).then(([catRes, subRes]) => {
      setCategories(catRes.data.data || []);
      setSubcategories(subRes.data.data || []);
    });
  }, []);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      if (activeSubcategory) params.set("subcategory", activeSubcategory);
      if (activeGender && activeGender !== "All") params.set("gender", activeGender);
      const res = await api.get(`/api/public/products?${params.toString()}`);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSubcategory, activeGender]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "All") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    // Clearing category also clears subcategory
    if (key === "category") next.delete("subcategory");
    setSearchParams(next);
  };

  const clearAllFilters = () => setSearchParams({});

  const hasActiveFilters = activeCategory || activeSubcategory || (activeGender && activeGender !== "All");

  // Subcategories belonging to the active category
  const filteredSubcats = activeCategory
    ? subcategories.filter((s) => {
        const cat = categories.find((c) => c.slug === activeCategory);
        return cat ? s.category_id === cat.id : false;
      })
    : [];

  // Client-side search filter
  const visibleProducts = products.filter((p) =>
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const primaryImage = (p: ProductCard) =>
    p.product_images.find((i) => i.is_primary)?.image_url ||
    p.product_images[0]?.image_url ||
    null;

  return (
    <div className="min-h-screen" style={{ background: "#f8f6f2", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .jost { font-family: 'Jost', sans-serif; }

        .product-card { transition: box-shadow 0.25s ease, transform 0.25s ease; }
        .product-card:hover { box-shadow: 0 8px 32px rgba(42,31,20,0.12); transform: translateY(-3px); }
        .product-card img { transition: transform 0.5s ease; }
        .product-card:hover img { transform: scale(1.04); }

        .filter-chip { transition: all 0.2s; }
        .filter-chip:hover { border-color: #c8a96e; color: #5a4a3a; }
        .filter-chip.active { background: #2a1f14; color: white; border-color: #2a1f14; }

        .cat-btn { transition: all 0.2s; }
        .cat-btn:hover { background: #f3ede6; color: #5a4a3a; }
        .cat-btn.active { background: #2a1f14; color: white; }

        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

        .skeleton { background: linear-gradient(90deg, #ede8df 25%, #f3ede6 50%, #ede8df 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .search-input:focus { outline: none; border-color: #c8a96e; box-shadow: 0 0 0 3px rgba(200,169,110,0.15); }
      `}</style>

      <ShopNavbar />

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        {/* Breadcrumb */}
        <div className="jost flex items-center gap-2 text-xs text-[#9a8a78] mb-6" style={{ letterSpacing: '0.08em' }}>
          <span className="hover:text-[#5a4a3a] cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={12} />
          {activeCategory ? (
            <>
              <span
                className="hover:text-[#5a4a3a] cursor-pointer transition-colors capitalize"
                onClick={() => setFilter('subcategory', '')}
              >
                {activeCategory.replace(/-/g, ' ')}
              </span>
              {activeSubcategory && (
                <>
                  <ChevronRight size={12} />
                  <span className="text-[#5a4a3a] font-medium capitalize">{activeSubcategory.replace(/-/g, ' ')}</span>
                </>
              )}
            </>
          ) : (
            <span className="text-[#5a4a3a] font-medium">All Products</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-light text-[#2a1f14] tracking-wide capitalize">
              {activeSubcategory
                ? activeSubcategory.replace(/-/g, ' ')
                : activeCategory
                ? activeCategory.replace(/-/g, ' ')
                : "All Products"}
            </h1>
            <p className="jost text-xs text-[#9a8a78] mt-1 uppercase tracking-widest">
              {loading ? "Loading..." : `${visibleProducts.length} ${visibleProducts.length === 1 ? "product" : "products"}`}
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8a78]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="search-input jost pl-9 pr-4 py-2.5 text-sm rounded-xl border border-[#e8dfd4] bg-white text-[#2a1f14] placeholder:text-[#b0a090] w-64 transition-all"
              style={{ letterSpacing: '0.03em' }}
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-[#e8dfd4]">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="jost sm:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e8dfd4] bg-white text-sm text-[#5a4a3a] font-medium"
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#c8a96e]" />}
          </button>

          {/* Desktop filters */}
          <div className={`w-full sm:w-auto flex flex-wrap items-center gap-2 ${filtersOpen ? 'flex' : 'hidden sm:flex'}`}>
            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`filter-chip jost px-4 py-2 rounded-full border text-[11px] uppercase tracking-widest font-medium ${!activeCategory ? 'active' : 'border-[#e8dfd4] bg-white text-[#8a7560]'}`}
                onClick={() => clearAllFilters()}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-chip jost px-4 py-2 rounded-full border text-[11px] uppercase tracking-widest font-medium capitalize ${activeCategory === cat.slug ? 'active' : 'border-[#e8dfd4] bg-white text-[#8a7560]'}`}
                  onClick={() => setFilter('category', cat.slug)}
                >
                  {(cat.name || cat.slug).replace(/-/g, ' ')}
                </button>
              ))}
            </div>

            {/* Subcategory chips — only shown when a category is active */}
            {filteredSubcats.length > 0 && (
              <div className="flex flex-wrap gap-2 pl-2 border-l border-[#e8dfd4]">
                {filteredSubcats.map((sub) => (
                  <button
                    key={sub.id}
                    className={`filter-chip jost px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-widest font-medium capitalize ${activeSubcategory === sub.slug ? 'active' : 'border-[#e8dfd4] bg-[#f3ede6] text-[#8a7560]'}`}
                    onClick={() => setFilter('subcategory', activeSubcategory === sub.slug ? '' : sub.slug)}
                  >
                    {(sub.name || sub.slug).replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            )}

            {/* Gender filter */}
            <div className="flex gap-1 pl-2 border-l border-[#e8dfd4]">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  className={`filter-chip jost px-3 py-1.5 rounded-full border text-[10px] uppercase tracking-widest font-medium ${activeGender === g || (!activeGender && g === 'All') ? 'active' : 'border-[#e8dfd4] bg-white text-[#8a7560]'}`}
                  onClick={() => setFilter('gender', g)}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Clear all */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="jost flex items-center gap-1.5 text-[11px] text-[#9a8a78] hover:text-red-400 transition-colors uppercase tracking-widest ml-1"
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton rounded-2xl aspect-[3/4] w-full" />
                <div className="skeleton h-4 rounded-lg w-3/4" />
                <div className="skeleton h-3 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#f3ede6] flex items-center justify-center">
              <ShoppingBag size={32} className="text-[#c8a96e]" />
            </div>
            <div>
              <h2 className="text-3xl font-light text-[#2a1f14] mb-2">No products found</h2>
              <p className="jost text-sm text-[#9a8a78] tracking-wider">Try adjusting your filters or search query</p>
            </div>
            <button
              onClick={clearAllFilters}
              className="jost px-8 py-3 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all hover:opacity-90"
              style={{ background: "#2a1f14", color: "white" }}
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product, i) => {
              const img = primaryImage(product);
              const price = parseFloat(product.base_price) || 0;
              return (
                <div
                  key={product.id}
                  className="product-card fade-in bg-white rounded-2xl border border-[#e8dfd4] overflow-hidden cursor-pointer"
                  style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                  onClick={() => navigate(`/product/${product.slug}`)}
                >
                  {/* Image */}
                  <div className="aspect-[3/4] overflow-hidden bg-[#f3ede6]">
                    {img ? (
                      <img src={img} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={32} className="text-[#c8bfb4]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="jost text-[9px] uppercase tracking-widest text-[#9a8a78] mb-1 capitalize">
                      {product.subcategory.slug.replace(/-/g, ' ')}
                    </p>
                    <h3 className="text-base font-medium text-[#2a1f14] leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <span
                        className="font-semibold text-[#2a1f14]"
                        style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.2rem" }}
                      >
                        ${price.toFixed(2)}
                      </span>
                      <span className="jost text-[9px] uppercase tracking-widest text-[#9a8a78] capitalize">
                        {product.gender}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}