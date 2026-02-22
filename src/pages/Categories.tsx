import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Trash2, Plus, Loader2, X, FolderOpen, Image as ImageIcon, Upload } from "lucide-react";

interface CategoryAsset {
  id: number;
  asset_type: string;
  target_group: string;
  image_url: string;
}

interface Category {
  id: number;
  name: string;
  slug?: string;
  parent_segment?: string;
  gender?: string;
  org_id: number | null;
  supports_gender?: number;
  is_active?: number;
  created_at?: string;
  assets?: CategoryAsset[];
}

const PARENT_SEGMENTS = ["APPAREL", "ACCESSORIES", "FOOTWEAR", "STATIONERY", "HEADWEAR", "BAGS"] as const;
const GENDER_OPTIONS   = ["MENS", "WOMENS", "KIDS", "UNISEX"] as const;

// Segments where gender makes sense (apparel, footwear, headwear)
const GENDER_SUPPORTED_SEGMENTS = new Set(["APPAREL", "FOOTWEAR", "HEADWEAR"]);

// Pill colours per segment
const SEGMENT_COLORS: Record<string, string> = {
  APPAREL:     "bg-indigo-50 text-indigo-700",
  ACCESSORIES: "bg-purple-50 text-purple-700",
  FOOTWEAR:    "bg-orange-50 text-orange-700",
  STATIONERY:  "bg-yellow-50 text-yellow-700",
  HEADWEAR:    "bg-teal-50 text-teal-700",
  BAGS:        "bg-pink-50 text-pink-700",
};

const GENDER_COLORS: Record<string, string> = {
  MENS:   "bg-blue-50 text-blue-700",
  WOMENS: "bg-rose-50 text-rose-700",
  KIDS:   "bg-amber-50 text-amber-700",
  UNISEX: "bg-slate-100 text-slate-600",
};

const Categories: React.FC = () => {
  const [categories, setCategories]     = useState<Category[]>([]);
  const [loading, setLoading]           = useState(true);
  const [deletingId, setDeletingId]     = useState<number | null>(null);
  const [error, setError]               = useState<string | null>(null);

  // ── FORM STATE ────────────────────────────────────────────────────────────
  const [showModal, setShowModal]         = useState(false);
  const [creating, setCreating]           = useState(false);
  const [name, setName]                   = useState("");
  const [parentSegment, setParentSegment] = useState<string>("APPAREL");
  const [gender, setGender]               = useState<string>("UNISEX");
  const [supportsGender, setSupportsGender] = useState(0);
  const [isActive, setIsActive]           = useState(1);
  const [imageFile, setImageFile]         = useState<File | null>(null);
  const [imagePreview, setImagePreview]   = useState<string | null>(null);

  // ── SIZE CHART MODAL STATE ────────────────────────────────────────────────
  const [sizeChartModal, setSizeChartModal] = useState<{
    open: boolean; categoryId: number | null; categoryName: string;
  }>({ open: false, categoryId: null, categoryName: "" });
  const [sizeChartFile, setSizeChartFile]       = useState<File | null>(null);
  const [sizeChartPreview, setSizeChartPreview] = useState<string | null>(null);
  const [sizeChartTargetGroup, setSizeChartTargetGroup] = useState<"MEN" | "WOMEN" | "UNISEX">("UNISEX");
  const [uploadingChart, setUploadingChart]     = useState(false);

  // ── When segment changes, auto-toggle supports_gender & reset gender ──────
  const handleSegmentChange = (seg: string) => {
    setParentSegment(seg);
    if (GENDER_SUPPORTED_SEGMENTS.has(seg)) {
      setSupportsGender(1);
    } else {
      setSupportsGender(0);
      setGender("UNISEX");
    }
  };

  // ── When supports_gender toggled off, reset gender ────────────────────────
  const handleSupportsGenderChange = (val: number) => {
    setSupportsGender(val);
    if (val === 0) setGender("UNISEX");
  };

  // ── API calls ─────────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/categories");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreateCategory = async () => {
    if (!name.trim()) { alert("Category name is required"); return; }

    setCreating(true);
    try {
      const res = await api.post("/api/categories", {
        name,
        parent_segment: parentSegment,
        gender,
        supports_gender: supportsGender,
        is_active: isActive,
      });

      const categoryId = res.data.categoryId;

      // Optionally upload an initial size chart
      if (imageFile) {
        const formData = new FormData();
        formData.append("category_id", categoryId);
        formData.append("target_group", gender === "UNISEX" ? "UNISEX" : gender === "MENS" ? "MEN" : gender === "WOMENS" ? "WOMEN" : "UNISEX");
        formData.append("image", imageFile);

        await api.post("/api/categories/size-chart", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("Category created successfully");
      resetForm();
      fetchCategories();
    } catch (err: any) {
      console.error("Create failed", err);
      alert(err.response?.data?.message || "Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number, catName: string) => {
    if (!window.confirm(`Delete "${catName}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName("");
    setParentSegment("APPAREL");
    setGender("UNISEX");
    setSupportsGender(0);
    setIsActive(1);
    setImageFile(null);
    setImagePreview(null);
    setShowModal(false);
  };

  // ── Size Chart Modal ──────────────────────────────────────────────────────
  const openSizeChartModal = (categoryId: number, categoryName: string) => {
    setSizeChartModal({ open: true, categoryId, categoryName });
    setSizeChartFile(null);
    setSizeChartPreview(null);
    setSizeChartTargetGroup("UNISEX");
  };

  const closeSizeChartModal = () => {
    setSizeChartModal({ open: false, categoryId: null, categoryName: "" });
    setSizeChartFile(null);
    setSizeChartPreview(null);
  };

  const handleSizeChartFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSizeChartFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setSizeChartPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSizeChartUpload = async () => {
    if (!sizeChartFile || !sizeChartModal.categoryId) return;
    setUploadingChart(true);
    try {
      const formData = new FormData();
      formData.append("category_id", String(sizeChartModal.categoryId));
      formData.append("target_group", sizeChartTargetGroup);
      formData.append("image", sizeChartFile);

      await api.post("/api/categories/size-chart", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Size chart uploaded successfully");
      closeSizeChartModal();
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadingChart(false);
    }
  };

  // ── Derived: does the currently selected segment support gender? ──────────
  const segmentSupportsGender = GENDER_SUPPORTED_SEGMENTS.has(parentSegment);

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-grow overflow-y-auto px-6 md:px-8 py-8">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                  <FolderOpen size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
                  <p className="text-slate-500 font-medium">Manage product groups and assets</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105"
              >
                <Plus size={20} /> Add Category
              </button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                <p className="text-slate-500">Fetching categories...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500 font-medium">{error}</div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Segment</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Gender</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Size Chart</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Organization</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-16 text-center text-slate-400 font-medium">
                            No categories yet. Create your first one.
                          </td>
                        </tr>
                      ) : categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">

                          {/* Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <FolderOpen size={18} />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{cat.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-tight">ID: {cat.id}</div>
                              </div>
                            </div>
                          </td>

                          {/* Segment pill */}
                          <td className="px-6 py-4">
                            {cat.parent_segment ? (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${SEGMENT_COLORS[cat.parent_segment] ?? "bg-slate-100 text-slate-600"}`}>
                                {cat.parent_segment}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">—</span>
                            )}
                          </td>

                          {/* Gender pill */}
                          <td className="px-6 py-4">
                            {Number(cat.supports_gender) === 1 && cat.gender ? (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${GENDER_COLORS[cat.gender] ?? "bg-slate-100 text-slate-600"}`}>
                                {cat.gender}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">N/A</span>
                            )}
                          </td>

                          {/* Size Chart */}
                          <td className="px-6 py-4">
                            {cat.assets && cat.assets.length > 0 ? (
                              <div className="relative w-12 h-12 group/img cursor-pointer">
                                <img
                                  src={cat.assets[0].image_url}
                                  alt="Size Chart"
                                  className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-sm"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                                  <ImageIcon size={14} className="text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 italic">No asset</div>
                            )}
                          </td>

                          {/* Organization */}
                          <td className="px-6 py-4">
                            {cat.org_id ? (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">ORG: {cat.org_id}</span>
                            ) : (
                              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold uppercase">Global</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              {Number(cat.is_active) === 1 ? (
                                <>
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-sm font-bold text-emerald-700 uppercase tracking-tight">Active</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                                  <span className="text-sm font-bold text-slate-400 uppercase tracking-tight">Inactive</span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openSizeChartModal(cat.id, cat.name)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                title="Upload Size Chart"
                              >
                                <Upload size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id, cat.name)}
                                disabled={deletingId === cat.id}
                                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete Category"
                              >
                                {deletingId === cat.id
                                  ? <Loader2 className="animate-spin" size={18} />
                                  : <Trash2 size={18} />}
                              </button>
                            </div>
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

      {/* ── CREATE CATEGORY MODAL ──────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden"
            style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            {/* Modal header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 md:px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Plus size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Category</h2>
                  <p className="text-emerald-100 text-sm mt-1">Add a new product category</p>
                </div>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
                <X size={24} />
              </button>
            </div>

            <div className="px-6 md:px-8 py-6 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Category Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., T-Shirts, Running Shoes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Parent Segment */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Parent Segment <span className="text-red-500">*</span>
                </label>
                <select
                  value={parentSegment}
                  onChange={(e) => handleSegmentChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white font-medium"
                >
                  {PARENT_SEGMENTS.map((seg) => (
                    <option key={seg} value={seg}>{seg}</option>
                  ))}
                </select>
              </div>

              {/* Gender Support toggle — always visible but disabled for non-gender segments */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Gender Support
                  {!segmentSupportsGender && (
                    <span className="ml-2 text-xs text-slate-400 font-normal">(not applicable for {parentSegment})</span>
                  )}
                </label>
                <select
                  value={supportsGender}
                  onChange={(e) => handleSupportsGenderChange(Number(e.target.value))}
                  disabled={!segmentSupportsGender}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value={0}>No Gender Split (Unisex)</option>
                  <option value={1}>Has Gender Variants</option>
                </select>
              </div>

              {/* Gender selector — only shown when supports_gender = 1 */}
              {supportsGender === 1 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {GENDER_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                          gender === g
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select
                  value={isActive}
                  onChange={(e) => setIsActive(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              {/* Optional size chart */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Size Chart Image <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                {imagePreview ? (
                  <div className="relative mb-3">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl border-2 border-emerald-200" />
                    <button
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50 hover:bg-emerald-50">
                    <div className="text-emerald-600 font-semibold mb-1">Click to upload</div>
                    <p className="text-xs text-slate-500">or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-6 md:px-8 py-4 flex items-center gap-3 border-t border-slate-200">
              <button
                onClick={resetForm}
                disabled={creating}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={creating}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50"
              >
                {creating
                  ? <><Loader2 className="animate-spin" size={18} /> Creating...</>
                  : <><Plus size={18} /> Create Category</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD SIZE CHART MODAL ────────────────────────────────────────── */}
      {sizeChartModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden"
            style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Upload size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Upload Size Chart</h2>
                  <p className="text-slate-300 text-xs mt-0.5">{sizeChartModal.categoryName}</p>
                </div>
              </div>
              <button onClick={closeSizeChartModal} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Target Group</label>
                <select
                  value={sizeChartTargetGroup}
                  onChange={(e) => setSizeChartTargetGroup(e.target.value as "MEN" | "WOMEN" | "UNISEX")}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-slate-50 focus:bg-white font-medium"
                >
                  <option value="UNISEX">UNISEX</option>
                  <option value="MEN">MEN</option>
                  <option value="WOMEN">WOMEN</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Size Chart Image <span className="text-red-500">*</span>
                </label>
                {sizeChartPreview ? (
                  <div className="relative">
                    <img src={sizeChartPreview} alt="Preview" className="w-full h-48 object-contain rounded-xl border-2 border-emerald-200 bg-slate-50" />
                    <button
                      onClick={() => { setSizeChartFile(null); setSizeChartPreview(null); }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-50 hover:bg-emerald-50">
                    <Upload size={28} className="mx-auto text-slate-300 mb-2" />
                    <div className="text-emerald-600 font-semibold text-sm mb-1">Click to upload</div>
                    <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                    <input type="file" accept="image/*" onChange={handleSizeChartFileSelect} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex items-center gap-3 border-t border-slate-200">
              <button
                onClick={closeSizeChartModal}
                disabled={uploadingChart}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSizeChartUpload}
                disabled={!sizeChartFile || uploadingChart}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-2.5 rounded-lg transition-all"
              >
                {uploadingChart
                  ? <><Loader2 className="animate-spin" size={18} /> Uploading...</>
                  : <><Upload size={18} /> Upload Chart</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        tbody tr:hover { box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.1); }
      `}</style>
    </div>
  );
};

export default Categories;