import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CheckCircle2, ArrowRight, X, Image as ImageIcon } from "lucide-react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// Types
interface Category { id: number; name: string; }
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

// Image Interface for Preview and ViewType
interface SelectedImage {
  file: File;
  preview: string;
  view_type: 'FRONT' | 'BACK' | 'SIDE';
}

const NewProduct: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [productData, setProductData] = useState<ProductData>({
    name: "",
    description: "",
    short_description: "",
    gender: "UNISEX",
    base_price: "",
    category_id: "",
    subcategory_id: "",
    is_public: 1,
    has_variants: 1
  });

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get("/api/categories");
        setCategories(res.data.data || []);
      } catch (err) { console.error("Error fetching categories", err); }
    };
    fetchCats();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!productData.category_id) { setSubcategories([]); return; }
    const fetchSubs = async () => {
      try {
        const res = await api.get(`/api/subcategories/${productData.category_id}`);
        setSubcategories(res.data.data || []);
      } catch (err) { console.error("Error fetching subcategories", err); }
    };
    fetchSubs();
  }, [productData.category_id]);

  // Handle product submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: productData.name,
        description: productData.description || null,
        short_description: productData.short_description || null,
        gender: productData.gender || null,
        base_price: parseFloat(productData.base_price || "0"),
        category_id: parseInt(productData.category_id),
        subcategory_id: parseInt(productData.subcategory_id),
        is_public: productData.is_public,
        has_variants: productData.has_variants,
        is_active: 1,
        is_featured: 0,
        meta_title: null,
        meta_description: null
      };

      const res = await api.post("/api/products/create", payload);
      setProductId(res.data.productId);
      setStep(2);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error creating product");
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
            <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <StepIndicator num={1} label="Basic Info" active={step === 1} completed={step > 1} />
              <div className="h-px bg-slate-200 flex-grow mx-6"></div>
              <StepIndicator num={2} label="Add Variants" active={step === 2} completed={step > 2} />
            </div>

            {step === 1 ? (
              <form onSubmit={handleProductSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in duration-500">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-800">Product Details</h2>
                  <p className="text-slate-500 text-sm">Fill in the basic information to list your product.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Product Name *" value={productData.name} onChange={(e) => setProductData({...productData, name: e.target.value})} required />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gender</label>
                    <select className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer" value={productData.gender} onChange={(e) => setProductData({...productData, gender: e.target.value})}>
                      <option value="MEN">MEN</option><option value="WOMEN">WOMEN</option><option value="UNISEX">UNISEX</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category *</label>
                    <select required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer" value={productData.category_id} onChange={(e) => setProductData({...productData, category_id: e.target.value, subcategory_id: ""})}>
                      <option value="">Select Category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subcategory *</label>
                    <select required disabled={!productData.category_id} value={productData.subcategory_id} onChange={(e) => setProductData({...productData, subcategory_id: e.target.value})} className={`p-2.5 border rounded-lg outline-none transition-all ${!productData.category_id ? "bg-slate-100 text-slate-400" : "bg-slate-50"}`}>
                      <option value="">Select Subcategory</option>
                      {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <InputGroup label="Base Price (₹)" type="number" value={productData.base_price} onChange={(e) => setProductData({...productData, base_price: e.target.value})} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visibility</label>
                    <select className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer" value={productData.is_public} onChange={(e) => setProductData({...productData, is_public: parseInt(e.target.value)})}>
                      <option value={1}>Public</option><option value={0}>Private</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Short Description</label>
                  <textarea className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg h-24 outline-none resize-none" value={productData.short_description} onChange={(e) => setProductData({...productData, short_description: e.target.value})} />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  {loading ? "Processing..." : "Save & Continue to Variants"} <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              <VariantSection productId={productId!} onFinish={() => navigate("/all-products")} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Variant Section with Image Fixes
const VariantSection = ({ productId, onFinish }: { productId: number, onFinish: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState({ color: "", size: "", sku: "", price: "", stock_quantity: 0 });
  const [variantsList, setVariantsList] = useState<any[]>([]);
  const [priceTiers, setPriceTiers] = useState<{ min_quantity: number; unit_price: string }[]>([]);
  
  // NEW: State for images with previews and view_types
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        view_type: 'FRONT' as 'FRONT' | 'BACK' | 'SIDE'
      }));
      setSelectedImages(prev => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview); // Clean memory
      return filtered;
    });
  };

  const updateImageViewType = (index: number, type: 'FRONT' | 'BACK' | 'SIDE') => {
    const updated = [...selectedImages];
    updated[index].view_type = type;
    setSelectedImages(updated);
  };

  const addVariant = async () => {
    if (!variant.color || !variant.size || !variant.sku || !variant.price) {
      return alert("Please fill all required variant fields");
    }
    setLoading(true);
    try {
      const res = await api.post("/api/products/add-variants", {
        product_id: productId,
        color: variant.color,
        size: variant.size,
        sku: variant.sku,
        price: parseFloat(variant.price),
        stock_quantity: variant.stock_quantity ?? 0,
        is_active: 1
      });

      const variantId = res.data.variantId;

      // Add price tiers
      for (const tier of priceTiers) {
        if (tier.min_quantity > 0 && parseFloat(tier.unit_price) > 0) {
          await api.post("/api/products/variants/price-tiers", {
            product_variant_id: variantId,
            min_quantity: tier.min_quantity,
            unit_price: parseFloat(tier.unit_price)
          });
        }
      }

      // NEW: Upload images with their respective View Types
      for (const imgObj of selectedImages) {
        const formData = new FormData();
        formData.append("images", imgObj.file);
        formData.append("product_variant_id", variantId.toString());
        formData.append("view_type", imgObj.view_type);

        await api.post("/api/products/variants/images", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      alert("Variant added successfully!");
      setVariantsList([...variantsList, { ...variant, id: variantId }]);
      setVariant({ color: "", size: "", sku: "", price: "", stock_quantity: 0 });
      setPriceTiers([]);
      setSelectedImages([]);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error adding variant");
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">Add Product Variants</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <InputGroup label="Color" placeholder="Red" value={variant.color} onChange={(e: any) => setVariant({...variant, color: e.target.value})} />
        <InputGroup label="Size" placeholder="M" value={variant.size} onChange={(e: any) => setVariant({...variant, size: e.target.value})} />
        <InputGroup label="SKU" placeholder="SKU-001" value={variant.sku} onChange={(e: any) => setVariant({...variant, sku: e.target.value})} />
        <InputGroup label="Price" type="number" value={variant.price} onChange={(e: any) => setVariant({...variant, price: e.target.value})} />
        <InputGroup label="Stock" type="number" value={variant.stock_quantity.toString()} onChange={(e: any) => setVariant({...variant, stock_quantity: parseInt(e.target.value)})} />
      </div>

      {/* Price Tiers */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700 uppercase">Price Tiers</h3>
        {priceTiers.map((tier, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input type="number" placeholder="Min Qty" className="p-2 border rounded-lg w-24" value={tier.min_quantity} onChange={(e) => {
              const newTiers = [...priceTiers]; newTiers[idx].min_quantity = parseInt(e.target.value); setPriceTiers(newTiers);
            }} />
            <input type="number" placeholder="Unit Price" className="p-2 border rounded-lg w-32" value={tier.unit_price} onChange={(e) => {
              const newTiers = [...priceTiers]; newTiers[idx].unit_price = e.target.value; setPriceTiers(newTiers);
            }} />
            <button onClick={() => setPriceTiers(priceTiers.filter((_, i) => i !== idx))} className="text-red-500 font-bold">X</button>
          </div>
        ))}
        <button onClick={() => setPriceTiers([...priceTiers, { min_quantity: 1, unit_price: "" }])} className="text-emerald-500 font-bold text-sm">+ Add Tier</button>
      </div>

      {/* NEW: Image Upload & Preview Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase">Variant Images & Views</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selectedImages.map((img, idx) => (
            <div key={idx} className="relative bg-slate-50 p-2 rounded-xl border border-slate-200 group">
              <img src={img.preview} alt="preview" className="w-full h-24 object-cover rounded-lg mb-2" />
              <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">
                <X size={12} />
              </button>
              <select 
                className="w-full text-[10px] p-1 border rounded bg-white font-bold"
                value={img.view_type}
                onChange={(e) => updateImageViewType(idx, e.target.value as any)}
              >
                <option value="FRONT">FRONT</option>
                <option value="BACK">BACK</option>
                <option value="SIDE">SIDE</option>
              </select>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-400">
            <ImageIcon size={24} />
            <span className="text-[10px] font-bold mt-1 uppercase">Add Image</span>
            <input type="file" multiple hidden accept="image/*" onChange={handleImageChange} />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <button onClick={addVariant} disabled={loading} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
          <Plus size={18} /> {loading ? "Adding..." : "Add Variant"}
        </button>
        <button onClick={onFinish} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">Complete & Finish</button>
      </div>
    </div>
  );
};

// Step Indicator Component
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

// Input Group Component
const InputGroup = ({ label, type = "text", ...props }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
    <input type={type} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20" {...props} />
  </div>
);

export default NewProduct;