import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import ProductCard from "../shop/components/ProductCard";
import { Filter, ChevronRight } from "lucide-react";
import ShopNavbar from "../shop/components/ShopNavbar";

// Types matching your API response
interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  category_id: number;
  category_name: string;
  sub_category_id: number;
  sub_category_name: string;
  main_image: string | null;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/public/public-products");
        setProducts(res.data.data);
      } catch (err) {
        console.error("Error loading shop data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // --- DERIVED STATE (Extract unique categories from products) ---
  const categories = Array.from(
    new Map(products.map(p => [p.category_id, { id: p.category_id, name: p.category_name }])).values()
  );

  const subcategories = Array.from(
    new Map(products.map(p => [p.sub_category_id, { id: p.sub_category_id, name: p.sub_category_name, category_id: p.category_id }])).values()
  );

  // Filter Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategoryId || p.category_id === selectedCategoryId;
    const matchesSubCategory = !selectedSubCategoryId || p.sub_category_id === selectedSubCategoryId;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopNavbar
        cartCount={0}
        onSearch={setSearchQuery}
        onLoginClick={() => (window.location.href = "/login")}
      />

      <div className="flex px-8 py-10 gap-10">
        {/* SIDEBAR */}
        <aside className="w-72 flex-shrink-0 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Collections</h3>
              {(selectedCategoryId || selectedSubCategoryId) && (
                <button 
                  onClick={() => { setSelectedCategoryId(null); setSelectedSubCategoryId(null); }}
                  className="text-[10px] font-bold text-indigo-600 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategoryId(prev => prev === cat.id ? null : cat.id);
                      setSelectedSubCategoryId(null); 
                    }}
                    className={`w-full text-left p-3 rounded-xl font-bold transition-all flex items-center justify-between group
                      ${selectedCategoryId === cat.id 
                        ? "bg-indigo-600 text-white shadow-lg" 
                        : "hover:bg-white text-slate-600 hover:text-indigo-600"}`}
                  >
                    {cat.name}
                    <ChevronRight size={16} className={`${selectedCategoryId === cat.id ? "rotate-90" : ""} transition-transform`} />
                  </button>

                  {/* Subcategories extracted from products */}
                  {selectedCategoryId === cat.id && (
                    <div className="ml-4 pl-4 border-l-2 border-slate-200 space-y-1 py-1">
                      {subcategories
                        .filter((sub) => sub.category_id === cat.id)
                        .map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedSubCategoryId(prev => prev === sub.id ? null : sub.id)}
                            className={`w-full text-left py-2 px-3 rounded-lg text-sm font-bold transition-all
                              ${selectedSubCategoryId === sub.id 
                                ? "text-indigo-600 bg-indigo-50" 
                                : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"}`}
                          >
                            {sub.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <div className="flex-grow">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-4xl font-black text-slate-900">
                {selectedCategoryId 
                  ? categories.find(c => c.id === selectedCategoryId)?.name 
                  : "Discover"}
              </h2>
              <p className="text-slate-500 font-medium italic">
                {filteredProducts.length} items found
              </p>
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
              <Filter size={20} className="text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3, 4].map((n) => <div key={n} className="aspect-[4/5] bg-slate-200 animate-pulse rounded-3xl" />)
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