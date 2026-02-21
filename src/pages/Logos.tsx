import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Pencil, Trash2, Plus, Search, Loader2, Image as ImageIcon, Globe, Lock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LogoVariant {
  id: number;
  color: string;
  image_url: string;
}

interface Logo {
  id: number;
  title: string;
  org_id: number | null;
  is_public: 0 | 1;
  organization_name?: string;
  variants?: LogoVariant[];
}

const Logos: React.FC = () => {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [color, setColor] = useState("Original");
  const [submitting, setSubmitting] = useState(false);

  const fetchLogos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/logos/all");
      setLogos(res.data || []);
    } catch (err) {
      console.error("Error fetching logos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogos(); }, []);

  const handleCreateLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a logo file");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("is_public", isPublic ? "1" : "0");
    formData.append("image", selectedFile);
    formData.append("color", color);

    try {
      await api.post("/api/logos/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowModal(false);
      resetForm();
      fetchLogos();
    } catch (err) {
      alert("Failed to create logo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, logoTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${logoTitle}"?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/logo/${id}`);
      setLogos((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setTitle("");
    setIsPublic(false);
    setSelectedFile(null);
    setColor("Original");
  };

  const filteredLogos = logos.filter((l) =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />
        <main className="p-8 overflow-y-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Organization Logos</h1>
              <p className="text-slate-500 font-medium">Manage brand assets and logo variants</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <Plus size={20} /> Add New Logo
            </button>
          </div>

          {/* Stats/Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search logos by title..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-xs uppercase tracking-widest font-bold text-slate-400">Logo Details</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-widest font-bold text-slate-400">Organization</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-widest font-bold text-slate-400">Status</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-widest font-bold text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <Loader2 className="mx-auto animate-spin text-indigo-500" size={40} />
                        <p className="mt-4 text-slate-400 font-medium">Fetching logos...</p>
                      </td>
                    </tr>
                  ) : filteredLogos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <p className="text-slate-400 font-medium">No logos found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogos.map((logo) => (
                      <tr key={logo.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-700 text-lg">{logo.title}</p>
                          <p className="text-xs text-slate-400">ID: #{logo.id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                            {logo.organization_name || "Global / System"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {logo.is_public ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                              <Globe size={12} /> Public
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 w-fit px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                              <Lock size={12} /> Private
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
  onClick={() => navigate(`/logo/${logo.id}`)}
  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
  title="Edit/View Logo"
>
  <Pencil size={18} />
</button>
                            <button
                              onClick={() => handleDelete(logo.id, logo.title)}
                              disabled={deletingId === logo.id}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                            >
                              {deletingId === logo.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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

      {/* Modal - Styled like Products Page Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-800">New Logo Asset</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateLogo} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">Logo Title</label>
                <input
                  type="text"
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium transition-all"
                  placeholder="e.g. Primary Brand Logo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 ml-1">Color Variant</label>
                  <input
                    type="text"
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium transition-all"
                    placeholder="Black / White"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
                <div className="flex items-end pb-3.5 pl-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-6 h-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500/20 transition-all cursor-pointer"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Make Public</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 ml-1">Upload File</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="logo-upload"
                    required
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 group-hover:bg-slate-100 group-hover:border-indigo-300 transition-all cursor-pointer"
                  >
                    {selectedFile ? (
                      <div className="text-center p-4">
                        <p className="text-indigo-600 font-bold truncate max-w-xs">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">Click to change file</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={32} className="text-slate-300 mb-2 group-hover:text-indigo-400" />
                        <p className="text-sm font-bold text-slate-400 group-hover:text-slate-600">Click to upload image</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : "Upload Logo Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logos;