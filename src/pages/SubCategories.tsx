import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  Trash2, Plus, Loader2, X, Layers, AlertCircle, CheckCircle2, Circle, Tag 
} from "lucide-react";

// 1. Interface for Type Safety
interface SubCategory {
  id: number;
  name: string;
  category_id: number;
  category_name: string; // Backend JOIN se aa raha hai
  is_active: number;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

const SubCategories: React.FC = () => {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Dropdown ke liye
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // FORM STATE
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [isActive, setIsActive] = useState(1);

  // Fetch all subcategories
  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/subcategories/all-subcat");
      setSubcategories(res.data.data || []);
    } catch (err) {
      setError("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  };

  // Dropdown ke liye Categories fetch karna
  const fetchParentCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching parent categories", err);
    }
  };

  useEffect(() => {
    fetchSubCategories();
    fetchParentCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !categoryId) {
      alert("Name and Parent Category are required");
      return;
    }

    setCreating(true);
    try {
      await api.post("/api/subcategories", {
        name,
        category_id: Number(categoryId),
        is_active: isActive
      });
      alert("Subcategory created!");
      resetForm();
      fetchSubCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/subcategories/${id}`);
      setSubcategories(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setName("");
    setCategoryId("");
    setIsActive(1);
    setShowModal(false);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-grow overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 text-white">
                  <Layers size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Subcategories</h1>
                  <p className="text-slate-500 font-medium">Manage variants under main categories</p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
              >
                <Plus size={20} /> Add Subcategory
              </button>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p>Loading subcategories...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subcategory</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Parent Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Created</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subcategories.map((sub) => (
                        <tr key={sub.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Tag size={16} />
                              </div>
                              <span className="font-bold text-slate-900">{sub.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                              {sub.category_name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {Number(sub.is_active) === 1 ? (
                                <><CheckCircle2 size={16} className="text-emerald-500" /><span className="text-sm text-emerald-700 font-medium">Active</span></>
                              ) : (
                                <><Circle size={16} className="text-slate-300" /><span className="text-sm text-slate-400 font-medium">Inactive</span></>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDelete(sub.id, sub.name)}
                              disabled={deletingId === sub.id}
                              className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                            >
                              {deletingId === sub.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <h2 className="text-xl font-bold">New Subcategory</h2>
              <button onClick={resetForm}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="e.g. Graphic Tees"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Parent Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
                <select
                  value={isActive}
                  onChange={(e) => setIsActive(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={resetForm} className="flex-1 px-4 py-2.5 font-bold text-slate-600">Cancel</button>
              <button 
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 bg-blue-600 text-white rounded-xl font-bold py-2.5 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                {creating ? <Loader2 className="animate-spin" size={18} /> : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategories;