import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../api/axiosInstance"; 
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Pencil, Trash2, Plus, Search, Filter, Loader2, Info, X } from "lucide-react";

// Product Data Type
interface Product {
  id: number;
  title: string;
  slug: string;
  is_active: 0 | 1;
  is_public: 0 | 1;
  organization_name: string;
  category_name: string;
  subcategory_name: string;
  creator_name: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null); 
  const [showNotice, setShowNotice] = useState(false);
  const navigate = useNavigate();
  

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/products/all-products");
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setShowNotice(true);
  };

  const handleConfirmAddProduct = () => {
    setShowNotice(false);
    navigate("/new-product");
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" and all its variants?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/api/products/${id}`);       
      setProducts(prev => prev.filter(p => p.id !== id));
      alert("Product deleted successfully");
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-grow overflow-y-auto p-8">

          {/* Notice Modal */}
          {showNotice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 mx-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                    <Info className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-800 font-semibold text-base mb-1">Before you continue</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Please make sure there is a <span className="font-semibold text-slate-700">Category</span> and <span className="font-semibold text-slate-700">Sub Category</span> created before adding a new product.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNotice(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    onClick={() => setShowNotice(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAddProduct}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                  >
                    Continue Anyway
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Products</h1>
              <p className="text-slate-500 text-sm">Manage your inventory and product listings.</p>
            </div>
            <button 
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
              onClick={handleAddProduct}
            >
              <Plus size={18} /> Add Product
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Search & Filter */}
            <div className="p-4 border-b border-slate-100 flex gap-4 bg-white">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-all">
                <Filter size={18} /> Filter
              </button>
            </div>

            <div className="overflow-x-auto relative">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Visibility</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Subcategory</th>
                    <th className="px-6 py-4">Creator</th>
                    <th className="px-6 py-4 text-center sticky right-0 bg-slate-50 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.04)] border-l border-slate-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-20">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin text-emerald-500" size={32} />
                          <span className="text-slate-400 text-sm font-medium">Loading products...</span>
                        </div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-20 text-slate-400 italic">
                        No products found in the inventory.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div 
                            className="font-semibold text-slate-800 cursor-pointer hover:text-emerald-600 transition-colors"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            {product.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{product.slug}</div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-block ${
                            product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}>
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-block ${
                            product.is_public ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                          }`}>
                            {product.is_public ? "Public" : "Private"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">{product.category_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{product.subcategory_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{product.creator_name}</td>
                        
                        <td className="px-6 py-4 sticky right-0 bg-white group-hover:bg-slate-50 transition-colors border-l border-slate-100 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => navigate(`/products/${product.id}`)}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition-all border border-transparent hover:border-blue-200" 
                              title="Edit/View"
                            >
                              <Pencil size={18} />
                            </button>
                            
                            <button 
                              onClick={() => handleDelete(product.id, product.title)}
                              disabled={deletingId === product.id}
                              className={`p-2 rounded-lg transition-all border border-transparent 
                                ${deletingId === product.id 
                                  ? "text-slate-300 bg-slate-100 cursor-not-allowed" 
                                  : "text-slate-500 hover:text-red-600 hover:bg-red-100/50 hover:border-red-200"}`}
                              title="Delete Product"
                            >
                              {deletingId === product.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Products;