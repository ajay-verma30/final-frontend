import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CheckCircle2, ArrowRight, X, Image as ImageIcon, Trash2 } from "lucide-react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category    { id: number; name: string; }
interface Subcategory { id: number; name: string; }

interface ProductData {
  name: string;
  description: string;
  short_description: string;
  gender: string;
  base_price: string;
  category_id: string;
  subcategory_id: string;
  is_public: number;
  has_variants: number;
}

interface SelectedImage {
  file: File;
  preview: string;
  view_type: "FRONT" | "BACK" | "SIDE";
}

// NEW: Size row inside a variant
interface SizeRow {
  size: string;
  sku: string;
  stock_quantity: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const NewProduct: React.FC = () => {
  const navigate   = useNavigate();
  const [loading, setLoading]     = useState(false);
  const [step, setStep]           = useState(1);
  const [productId, setProductId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);   // ✅ NEW
  const [categories, setCategories]       = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [productData, setProductData] = useState<ProductData>({
    name: "", description: "", short_description: "",
    gender: "UNISEX", base_price: "",
    category_id: "", subcategory_id: "",
    is_public: 1, has_variants: 1,
  });

  const [defaultImages, setDefaultImages] = useState<SelectedImage[]>([]);

  // ── Image handlers ──────────────────────────────────────────────────────────
  const handleDefaultImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const remaining = 3 - defaultImages.length;
    if (remaining <= 0) return alert("Maximum 3 images allowed");
    const filesArray = Array.from(e.target.files).slice(0, remaining).map((file, i) => ({
      file,
      preview: URL.createObjectURL(file),
      view_type: (i === 0 ? "FRONT" : i === 1 ? "BACK" : "SIDE") as "FRONT" | "BACK" | "SIDE",
    }));
    setDefaultImages((prev) => [...prev, ...filesArray]);
    e.target.value = "";
  };

  const removeDefaultImage = (index: number) => {
    setDefaultImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── Fetch categories ────────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/api/categories")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.error("Error fetching categories", err));
  }, []);

  useEffect(() => {
    if (!productData.category_id) { setSubcategories([]); return; }
    api.get(`/api/subcategories/${productData.category_id}`)
      .then((res) => setSubcategories(res.data.data || []))
      .catch((err) => console.error("Error fetching subcategories", err));
  }, [productData.category_id]);

  // ── Step 1: Submit Product ──────────────────────────────────────────────────
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name",              productData.name);
      formData.append("description",       productData.description || "");
      formData.append("short_description", productData.short_description || "");
      formData.append("gender",            productData.gender || "UNISEX");
      formData.append("base_price",        String(parseFloat(productData.base_price || "0")));
      formData.append("category_id",       productData.category_id);
      formData.append("subcategory_id",    productData.subcategory_id);
      formData.append("is_public",         String(productData.is_public));
      formData.append("has_variants",      String(productData.has_variants));
      formData.append("is_active",         "1");
      formData.append("is_featured",       "0");

      defaultImages.forEach((img) => formData.append("images", img.file));

      const res = await api.post("/api/products/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProductId(res.data.productId);
      setStep(2);
    } catch (err: any) {
      const status  = err?.response?.status;
      const rawData = err?.response?.data;
      console.error("CREATE PRODUCT — HTTP", status, rawData);

      // HTML response = Express middleware crash (upload/auth/DB)
      const isHtml = typeof rawData === "string" && rawData.trim().startsWith("<");
      const msg = isHtml
        ? `Server error (${status}): Backend middleware crash — Railway logs check karein`
        : typeof rawData?.message === "string"
        ? rawData.message
        : rawData?.error
        ? String(rawData.error)
        : err?.message || "Unknown error — console check karein";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-grow overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">

            {/* Step indicator */}
            <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <StepIndicator num={1} label="Basic Info"    active={step === 1} completed={step > 1} />
              <div className="h-px bg-slate-200 flex-grow mx-6" />
              <StepIndicator num={2} label="Add Variants"  active={step === 2} completed={step > 2} />
            </div>

            {step === 1 ? (
              /* ──────────── STEP 1: PRODUCT FORM ──────────── */
              <form onSubmit={handleProductSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-800">Product Details</h2>
                  <p className="text-slate-500 text-sm">Fill in the basic information to list your product.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Product Name *" value={productData.name} onChange={(e: any) => setProductData({ ...productData, name: e.target.value })} required />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gender</label>
                    <select className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer" value={productData.gender} onChange={(e) => setProductData({ ...productData, gender: e.target.value })}>
                      <option value="MEN">MEN</option>
                      <option value="WOMEN">WOMEN</option>
                      <option value="UNISEX">UNISEX</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category *</label>
                    <select required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer" value={productData.category_id} onChange={(e) => setProductData({ ...productData, category_id: e.target.value, subcategory_id: "" })}>
                      <option value="">Select Category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subcategory *</label>
                    <select required disabled={!productData.category_id} value={productData.subcategory_id} onChange={(e) => setProductData({ ...productData, subcategory_id: e.target.value })} className={`p-2.5 border rounded-lg outline-none transition-all ${!productData.category_id ? "bg-slate-100 text-slate-400" : "bg-slate-50"}`}>
                      <option value="">Select Subcategory</option>
                      {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <InputGroup label="Base Price (₹)" type="number" value={productData.base_price} onChange={(e: any) => setProductData({ ...productData, base_price: e.target.value })} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visibility</label>
                    <select className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer" value={productData.is_public} onChange={(e) => setProductData({ ...productData, is_public: parseInt(e.target.value) })}>
                      <option value={1}>Public</option>
                      <option value={0}>Private</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Short Description</label>
                  <textarea className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg h-24 outline-none resize-none" value={productData.short_description} onChange={(e) => setProductData({ ...productData, short_description: e.target.value })} />
                </div>

                {/* Default Product Images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Default Images <span className="text-slate-300 normal-case font-medium">(max 3 — first becomes primary)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">{defaultImages.length}/3</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {defaultImages.map((img, idx) => (
                      <div key={idx} className="relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden group">
                        <img src={img.preview} alt={`preview-${idx}`} className="w-full h-28 object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Primary</span>
                        )}
                        <button type="button" onClick={() => removeDefaultImage(idx)} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                        <div className="px-2 py-1.5 text-[10px] font-bold text-slate-500 uppercase text-center bg-white border-t border-slate-100">
                          {img.view_type}
                        </div>
                      </div>
                    ))}
                    {defaultImages.length < 3 && (
                      <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-400 transition-colors">
                        <ImageIcon size={22} />
                        <span className="text-[10px] font-bold mt-1.5 uppercase">Add Image</span>
                        <input type="file" multiple hidden accept="image/*" onChange={handleDefaultImageChange} />
                      </label>
                    )}
                  </div>
                </div>

                {/* ✅ Error banner */}
                {errorMsg && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    <span className="text-lg leading-none">⚠️</span>
                    <div>
                      <p className="font-bold text-sm">Error</p>
                      <p className="text-sm mt-0.5">{errorMsg}</p>
                    </div>
                    <button type="button" onClick={() => setErrorMsg(null)} className="ml-auto text-red-400 hover:text-red-600">
                      <X size={16} />
                    </button>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  {loading ? "Processing..." : "Save & Continue to Variants"} <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              /* ──────────── STEP 2: VARIANTS ──────────── */
              <VariantSection productId={productId!} onFinish={() => navigate("/all-products")} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};


// ─── Variant Section ──────────────────────────────────────────────────────────
const VariantSection = ({ productId, onFinish }: { productId: number; onFinish: () => void }) => {
  const [loading, setLoading] = useState(false);

  // Variant-level fields (no size/stock — those go in sizes array)
  const [variant, setVariant] = useState({ color: "", sku: "", price: "" });

  // Multiple sizes for this variant
  const [sizes, setSizes] = useState<SizeRow[]>([
    { size: "", sku: "", stock_quantity: 0 },
  ]);

  const [priceTiers, setPriceTiers]       = useState<{ min_quantity: number; unit_price: string }[]>([]);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [variantsList, setVariantsList]   = useState<any[]>([]);

  // ── Size row helpers ─────────────────────────────────────────────────────────
  const addSizeRow = () =>
    setSizes((prev) => [...prev, { size: "", sku: "", stock_quantity: 0 }]);

  const removeSizeRow = (idx: number) =>
    setSizes((prev) => prev.filter((_, i) => i !== idx));

  const updateSize = (idx: number, field: keyof SizeRow, value: string | number) =>
    setSizes((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));

  // ── Image helpers ────────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      view_type: "FRONT" as "FRONT" | "BACK" | "SIDE",
    }));
    setSelectedImages((prev) => [...prev, ...filesArray]);
  };

  const removeImage = (idx: number) => {
    setSelectedImages((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateImageViewType = (idx: number, type: "FRONT" | "BACK" | "SIDE") => {
    setSelectedImages((prev) =>
      prev.map((img, i) => (i === idx ? { ...img, view_type: type } : img))
    );
  };

  // ── Add Variant ──────────────────────────────────────────────────────────────
  const addVariant = async () => {
    // Validation
    if (!variant.color || !variant.price) {
      return alert("Color aur Price required hai");
    }
    const validSizes = sizes.filter((s) => s.size.trim() && s.sku.trim());
    if (validSizes.length === 0) {
      return alert("Kam se kam ek size daalna zaroori hai (size aur SKU dono)");
    }

    setLoading(true);
    try {
      // 1️⃣ Create Variant (color + price only, no size)
      const variantRes = await api.post("/api/products/add-variants", {
        product_id:     productId,
        color:          variant.color,
        sku:            variant.sku || undefined,
        price:          parseFloat(variant.price),
        is_active:      1,
      });
      const variantId: number = variantRes.data.variantId;

      // 2️⃣ Add each size via POST /variants/sizes
      for (const sz of validSizes) {
        await api.post("/api/products/variants/sizes", {
          product_variant_id: variantId,
          size:               sz.size.trim().toUpperCase(),
          sku:                sz.sku.trim(),
          stock_quantity:     sz.stock_quantity || 0,
          is_active:          1,
        });
      }

      // 3️⃣ Add price tiers
      for (const tier of priceTiers) {
        if (tier.min_quantity > 0 && parseFloat(tier.unit_price) > 0) {
          await api.post("/api/products/variants/price-tiers", {
            product_variant_id: variantId,
            min_quantity:       tier.min_quantity,
            unit_price:         parseFloat(tier.unit_price),
          });
        }
      }

      // 4️⃣ Upload images
      for (const imgObj of selectedImages) {
        const formData = new FormData();
        formData.append("images",             imgObj.file);
        formData.append("product_variant_id", variantId.toString());
        formData.append("view_type",          imgObj.view_type);
        await api.post("/api/products/variants/images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 5️⃣ Reset form
      setVariantsList((prev) => [
        ...prev,
        {
          id: variantId,
          color: variant.color,
          price: variant.price,
          sizes: validSizes,
        },
      ]);
      setVariant({ color: "", sku: "", price: "" });
      setSizes([{ size: "", sku: "", stock_quantity: 0 }]);
      setPriceTiers([]);
      setSelectedImages([]);
      alert("Variant successfully add ho gaya!");
    } catch (err: any) {
      const status  = err?.response?.status;
      const rawData = err?.response?.data;
      console.error("ADD VARIANT — HTTP", status, rawData);
      const isHtml  = typeof rawData === "string" && rawData.trim().startsWith("<");
      const msg = isHtml
        ? `Server error (${status}): Backend crash — Railway logs check karein`
        : typeof rawData?.message === "string"
        ? rawData.message
        : err?.message || "Error adding variant";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── Added Variants Summary ─────────────────────────────────────────── */}
      {variantsList.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
            Added Variants ({variantsList.length})
          </h3>
          <div className="space-y-2">
            {variantsList.map((v, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <span className="w-4 h-4 rounded-full border border-slate-300 inline-block" style={{ backgroundColor: v.color.toLowerCase() }} />
                  {v.color}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-sm text-slate-600">₹{v.price}</span>
                <span className="text-slate-400 text-xs">•</span>
                <div className="flex flex-wrap gap-1">
                  {v.sizes.map((sz: SizeRow, si: number) => (
                    <span key={si} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
                      {sz.size} — {sz.stock_quantity} pcs
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── New Variant Form ──────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-800">Add Product Variant</h2>
          <p className="text-slate-500 text-sm">Ek color ke liye multiple sizes add kar sakte ho.</p>
        </div>

        {/* ── Variant Core Fields ── */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Variant Info</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <InputGroup
              label="Color *"
              placeholder="e.g. RED"
              value={variant.color}
              onChange={(e: any) => setVariant({ ...variant, color: e.target.value })}
            />
            <InputGroup
              label="Variant SKU (optional)"
              placeholder="e.g. SKU-RED"
              value={variant.sku}
              onChange={(e: any) => setVariant({ ...variant, sku: e.target.value })}
            />
            <InputGroup
              label="Price (₹) *"
              type="number"
              placeholder="0"
              value={variant.price}
              onChange={(e: any) => setVariant({ ...variant, price: e.target.value })}
            />
          </div>
        </div>

        {/* ── Sizes ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Sizes * <span className="normal-case font-normal text-slate-400">(har size ka alag SKU aur stock)</span>
            </p>
            <button
              onClick={addSizeRow}
              className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Plus size={14} /> Add Size
            </button>
          </div>

          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-3 px-1">
              {["Size", "SKU *", "Stock Qty", ""].map((h, i) => (
                <span key={i} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            {sizes.map((row, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-3 items-center bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                <input
                  type="text"
                  placeholder="S / M / L / XL"
                  value={row.size}
                  onChange={(e) => updateSize(idx, "size", e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase"
                />
                <input
                  type="text"
                  placeholder="e.g. SKU-RED-M"
                  value={row.sku}
                  onChange={(e) => updateSize(idx, "sku", e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <input
                  type="number"
                  placeholder="0"
                  min={0}
                  value={row.stock_quantity}
                  onChange={(e) => updateSize(idx, "stock_quantity", parseInt(e.target.value) || 0)}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  onClick={() => removeSizeRow(idx)}
                  disabled={sizes.length === 1}
                  className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Price Tiers ── */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price Tiers (Bulk pricing)</p>
          {priceTiers.map((tier, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              <input
                type="number"
                placeholder="Min Qty"
                className="p-2 border border-slate-200 rounded-lg w-28 text-sm outline-none"
                value={tier.min_quantity}
                onChange={(e) => {
                  const t = [...priceTiers];
                  t[idx].min_quantity = parseInt(e.target.value);
                  setPriceTiers(t);
                }}
              />
              <input
                type="number"
                placeholder="Unit Price"
                className="p-2 border border-slate-200 rounded-lg w-36 text-sm outline-none"
                value={tier.unit_price}
                onChange={(e) => {
                  const t = [...priceTiers];
                  t[idx].unit_price = e.target.value;
                  setPriceTiers(t);
                }}
              />
              <button onClick={() => setPriceTiers(priceTiers.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setPriceTiers([...priceTiers, { min_quantity: 1, unit_price: "" }])}
            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors"
          >
            <Plus size={14} /> Add Tier
          </button>
        </div>

        {/* ── Variant Images ── */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variant Images</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedImages.map((img, idx) => (
              <div key={idx} className="relative bg-slate-50 p-2 rounded-xl border border-slate-200 group">
                <img src={img.preview} alt="preview" className="w-full h-24 object-cover rounded-lg mb-2" />
                <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                  <X size={12} />
                </button>
                <select
                  className="w-full text-[10px] p-1 border border-slate-200 rounded bg-white font-bold"
                  value={img.view_type}
                  onChange={(e) => updateImageViewType(idx, e.target.value as any)}
                >
                  <option value="FRONT">FRONT</option>
                  <option value="BACK">BACK</option>
                  <option value="SIDE">SIDE</option>
                </select>
              </div>
            ))}
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-400 transition-colors">
              <ImageIcon size={24} />
              <span className="text-[10px] font-bold mt-1 uppercase">Add Image</span>
              <input type="file" multiple hidden accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={addVariant}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={18} />
            {loading ? "Saving..." : "Save Variant & Add Another"}
          </button>
          <button
            onClick={onFinish}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold transition-colors"
          >
            Complete & Finish
          </button>
        </div>
      </div>
    </div>
  );
};


// ─── Reusable Components ──────────────────────────────────────────────────────
const StepIndicator = ({ num, label, active, completed }: any) => (
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
      completed ? "bg-emerald-500 text-white" : active ? "bg-slate-900 text-white scale-110 shadow-lg" : "bg-slate-100 text-slate-400"
    }`}>
      {completed ? <CheckCircle2 size={20} /> : num}
    </div>
    <span className={`text-sm font-bold ${active || completed ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
  </div>
);

const InputGroup = ({ label, type = "text", ...props }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <input type={type} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20" {...props} />
  </div>
);

export default NewProduct;