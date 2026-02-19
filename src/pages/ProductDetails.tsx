import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Trash2,Edit3, Save, X, Plus, Package, Palette, Loader2, AlertCircle, Layers, MapPin, Ruler
} from 'lucide-react';
import api from "../api/axiosInstance"; 
import Sidebar from "../components/Sidebar"; 
import Navbar from "../components/Navbar";   
import { useNavigate } from 'react-router-dom';


const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<any>(null);
  
  const [editForm, setEditForm] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<{[key: number]: File[]}>({});
  const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);
  const [deleteVariantIds, setDeleteVariantIds] = useState<number[]>([]);

  // ✅ FETCH PRODUCT DATA
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get(`/api/products/${id}`);
      
      if (res.data && res.data.product) {
        setProduct(res.data.product);
        setEditForm(JSON.parse(JSON.stringify(res.data.product))); // Deep copy
      } else {
        setError('Invalid response format');
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch product';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // ✅ HANDLE UPDATE
  const handleUpdate = async () => {
    if (!editForm) return;

    setIsSaving(true);
    const formData = new FormData();

    try {
      // 1. ✅ BASIC PRODUCT DETAILS
      formData.append('name', editForm.name || '');
      formData.append('description', editForm.description || '');
      formData.append('short_description', editForm.short_description || '');
      formData.append('base_price', String(editForm.base_price || 0));
      formData.append('gender', editForm.gender || '');
      formData.append('category_id', String(editForm.category_id || ''));
      formData.append('subcategory_id', String(editForm.subcategory_id || ''));
      formData.append('is_active', editForm.is_active ? '1' : '0');
      formData.append('is_featured', editForm.is_featured ? '1' : '0');
      formData.append('is_public', editForm.is_public ? '1' : '0');

      // 2. ✅ DELETE IDS (as JSON strings for form-data)
      formData.append('delete_image_ids', JSON.stringify(deleteImageIds));
      formData.append('delete_variant_ids', JSON.stringify(deleteVariantIds));

      // 3. ✅ VARIANTS WITH ALL DETAILS
      const variantsData = (editForm.variants || []).map((variant: any, index: number) => {
        // Create unique key for files
        const variantKey = variant.id && variant.id !== 'new'
          ? `variant_images_${variant.id}`
          : `variant_images_new_${index}`;

        // ✅ ADD NEW FILES TO FORMDATA
        if (selectedFiles[variant.id] && selectedFiles[variant.id].length > 0) {
          selectedFiles[variant.id].forEach((file: File) => {
            formData.append(variantKey, file);
          });
        }

        // ✅ RETURN VARIANT DATA
        return {
          id: variant.id || null,
          color: variant.color || '',
          size: variant.size || '',
          sku: variant.sku || '',
          price: parseFloat(variant.price) || 0,
          stock_quantity: parseInt(variant.stock_quantity) || 0,
          is_active: variant.is_active ? 1 : 0,
          price_tiers: variant.price_tiers || [],
          view_type: variant.view_type || 'FRONT'
        };
      });

      formData.append('variants', JSON.stringify(variantsData));

      // 4. ✅ API CALL WITH ERROR HANDLING
      const response = await api.put(`api/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success || response.data.message) {
        alert('✅ Product updated successfully!');
        
        // Reset states
        setIsEditing(false);
        setSelectedFiles({});
        setDeleteImageIds([]);
        setDeleteVariantIds([]);
        
        // Refresh product data
        await fetchProduct();
      }
    } catch (error: any) {
      console.error("Update Error:", error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update product';
      setError(errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ HANDLE CANCEL EDIT
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedFiles({});
    setDeleteImageIds([]);
    setDeleteVariantIds([]);
    // Reset form to original product data
    if (product) {
      setEditForm(JSON.parse(JSON.stringify(product)));
    }
  };

  // ✅ HANDLE ADD NEW VARIANT
  const handleAddVariant = () => {
    const newVariant = {
      id: `new_${Date.now()}`,
      color: '',
      size: '',
      sku: '',
      price: 0,
      stock_quantity: 0,
      is_active: 1,
      images: [],
      price_tiers: []
    };

    const updatedVariants = [...(editForm.variants || []), newVariant];
    setEditForm({ ...editForm, variants: updatedVariants });
  };

  // ✅ HANDLE DELETE VARIANT
  const handleDeleteVariant = (variantId: any, variantIndex: number) => {
    if (typeof variantId === 'number') {
      setDeleteVariantIds([...deleteVariantIds, variantId]);
    }
    
    const updatedVariants = editForm.variants.filter((_: any, idx: number) => idx !== variantIndex);
    setEditForm({ ...editForm, variants: updatedVariants });
  };

  // ✅ HANDLE VARIANT FIELD CHANGE
  const handleVariantChange = (variantIndex: number, field: string, value: any) => {
    const updatedVariants = [...editForm.variants];
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      [field]: value
    };
    setEditForm({ ...editForm, variants: updatedVariants });
  };

  // ✅ HANDLE DELETE EXISTING IMAGE
  const handleDeleteImage = (variantIndex: number, imageId: number) => {
    setDeleteImageIds([...deleteImageIds, imageId]);
    
    const updatedVariants = [...editForm.variants];
    updatedVariants[variantIndex].images = updatedVariants[variantIndex].images.filter(
      (img: any) => img.id !== imageId
    );
    setEditForm({ ...editForm, variants: updatedVariants });
  };

  // ✅ HANDLE DELETE NEW IMAGE (from selectedFiles)
  const handleDeleteNewImage = (variantId: any, fileIndex: number) => {
    const files = selectedFiles[variantId] || [];
    const updatedFiles = files.filter((_: File, idx: number) => idx !== fileIndex);
    
    if (updatedFiles.length === 0) {
      const newSelectedFiles = { ...selectedFiles };
      delete newSelectedFiles[variantId];
      setSelectedFiles(newSelectedFiles);
    } else {
      setSelectedFiles({ ...selectedFiles, [variantId]: updatedFiles });
    }
  };


  // ✅ DELETE CUSTOMIZATION HANDLER
const handleDeleteCustomization = async (id: number) => {
  if (!window.confirm("Are you sure you want to delete this customization?")) return;

  try {
    // API Call (As per your route: /delete/:id)
    await api.delete(`/api/customizations/delete/${id}`);
    
    alert("✅ Customization deleted successfully!");
    
    // UI Refresh: Product data dobara fetch karein taaki list update ho jaye
    fetchProduct(); 
    
  } catch (err: any) {
    console.error("DELETE ERROR:", err);
    alert(err.response?.data?.message || "Failed to delete customization");
  }
};

  // ✅ LOADING STATE
  if (loading) return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  // ✅ ERROR STATE
  if (error && !product) return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl p-8 border-l-4 border-red-500 max-w-md">
        <div className="flex items-center gap-4 mb-4">
          <AlertCircle className="text-red-500" size={24} />
          <h2 className="text-lg font-bold text-slate-900">Error Loading Product</h2>
        </div>
        <p className="text-slate-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (!product) return null;

  const displayData = isEditing ? editForm : product;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />
        
        {/* Main Content Area - Scrollable */}
        <main className="flex-grow overflow-y-auto p-4 md:p-8">
          
          {/* ✅ ACTION BAR */}
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
  <div>
    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
      {isEditing ? '✏️ Editing Product' : product.name}
    </h1>
    <p className="text-slate-500 mt-1 font-medium">
      ID: #{product.id} • {product.category_name} / {product.subcategory_name}
    </p>
  </div>
  
  <div className="flex gap-3">
    {!isEditing ? (
      <>
        {/* --- NAYA CUSTOMIZE BUTTON --- */}
      <button 
  onClick={() => navigate(`/customize/${product.id}`)}
  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-100 transition-all"
>
  <Palette size={18} /> Customize Design
</button>

        {/* --- EXISTING EDIT BUTTON --- */}
        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
        >
          <Edit3 size={18} /> Edit Product
        </button>
      </>
    ) : (
      <>
        <button 
          onClick={handleCancelEdit}
          disabled={isSaving}
          className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          <X size={18} /> Cancel
        </button>
        <button 
          onClick={handleUpdate}
          disabled={isSaving}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-black transition-all shadow-lg disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save size={18} /> Update
            </>
          )}
        </button>
      </>
    )}
  </div>
</div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column: Product Info & Variants */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* ✅ BASIC DETAILS SECTION */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                  <Package className="text-indigo-500" /> Basic Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Product Name</label>
                    {isEditing ? (
                      <input 
                        className="w-full text-lg font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        placeholder="Enter product name"
                      />
                    ) : (
                      <p className="text-xl font-bold text-slate-800">{product.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Base Price ($)</label>
                    {isEditing ? (
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono outline-none transition-all"
                        value={editForm.base_price || 0}
                        onChange={(e) => setEditForm({...editForm, base_price: parseFloat(e.target.value)})}
                      />
                    ) : (
                      <p className="text-xl font-bold text-emerald-600 font-mono">${parseFloat(product.base_price).toFixed(2)}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Gender</label>
                    {isEditing ? (
                      <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={editForm.gender || ''}
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                      >
                        <option value="">Select Gender</option>
                        <option value="M">Men</option>
                        <option value="F">Women</option>
                        <option value="U">Unisex</option>
                      </select>
                    ) : (
                      <span className="inline-block px-4 py-1.5 bg-slate-100 rounded-lg font-bold text-slate-700">
                        {product.gender === 'M' ? 'Men' : product.gender === 'F' ? 'Women' : 'Unisex'}
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 mb-2 block uppercase">Description</label>
                    {isEditing ? (
                      <textarea 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 min-h-[120px] outline-none transition-all"
                        value={editForm.short_description || ''}
                        onChange={(e) => setEditForm({...editForm, short_description: e.target.value})}
                        placeholder="Enter product description"
                      />
                    ) : (
                      <p className="text-slate-600 leading-relaxed">{product.short_description || 'No description'}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* ✅ VARIANTS SECTION */}
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-2">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <Palette className="text-indigo-500" /> Variants ({displayData.variants?.length || 0})
                  </h2>
                  {isEditing && (
                    <button
                      onClick={handleAddVariant}
                      className="flex items-center gap-2 bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-200 transition-all"
                    >
                      <Plus size={16} /> Add Variant
                    </button>
                  )}
                </div>
                
                {(!displayData.variants || displayData.variants.length === 0) ? (
                  <div className="bg-white p-8 rounded-3xl text-center text-slate-500 border border-slate-200">
                    <Palette size={40} className="mx-auto mb-4 opacity-30" />
                    <p>No variants yet</p>
                    {isEditing && (
                      <button
                        onClick={handleAddVariant}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                      >
                        + Add First Variant
                      </button>
                    )}
                  </div>
                ) : (
                  displayData.variants.map((variant: any, vIdx: number) => (
                    <div key={variant.id || vIdx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                      {/* Variant Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4 flex-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={variant.size || ''}
                              onChange={(e) => handleVariantChange(vIdx, 'size', e.target.value)}
                              placeholder="Size"
                              className="px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 font-bold border border-indigo-100 outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            <div className="px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 font-bold border border-indigo-100">
                              {variant.size || 'N/A'}
                            </div>
                          )}
                          <div className="flex-1">
                            {isEditing ? (
                              <input
                                type="text"
                                value={variant.color || ''}
                                onChange={(e) => handleVariantChange(vIdx, 'color', e.target.value)}
                                placeholder="Color"
                                className="w-full font-bold text-slate-800 uppercase tracking-wide bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            ) : (
                              <h4 className="font-bold text-slate-800 uppercase tracking-wide">{variant.color || 'N/A'}</h4>
                            )}
                            {isEditing ? (
                              <input
                                type="text"
                                value={variant.sku || ''}
                                onChange={(e) => handleVariantChange(vIdx, 'sku', e.target.value)}
                                placeholder="SKU"
                                className="text-[10px] font-mono text-slate-400 uppercase bg-slate-50 border border-slate-200 rounded-lg p-1 outline-none focus:ring-2 focus:ring-indigo-500 w-full mt-1"
                              />
                            ) : (
                              <p className="text-[10px] font-mono text-slate-400 uppercase">{variant.sku || 'N/A'}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-6">
                          <div className="text-center">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Stock</p>
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={variant.stock_quantity || 0}
                                onChange={(e) => handleVariantChange(vIdx, 'stock_quantity', parseInt(e.target.value))}
                                className="font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg p-1 w-20 outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            ) : (
                              <p className={`font-mono font-bold ${variant.stock_quantity < 5 ? 'text-orange-500' : 'text-slate-900'}`}>
                                {variant.stock_quantity}
                              </p>
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Price</p>
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.price || 0}
                                onChange={(e) => handleVariantChange(vIdx, 'price', parseFloat(e.target.value))}
                                className="font-mono font-bold text-emerald-600 bg-slate-50 border border-slate-200 rounded-lg p-1 w-24 outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            ) : (
                              <p className="font-mono font-bold text-emerald-600">${parseFloat(variant.price).toFixed(2)}</p>
                            )}
                          </div>
                        </div>

                        {/* Delete Variant Button */}
                        {isEditing && (
                          <button
                            onClick={() => handleDeleteVariant(variant.id, vIdx)}
                            className="bg-red-50 text-red-600 px-3 py-2 rounded-lg font-semibold hover:bg-red-100 transition-all"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      {/* Variant Images */}
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                        {/* Existing Images */}
                        {variant.images && variant.images.map((img: any) => (
                          <div key={img.id} className="relative group aspect-square">
                            <img 
                              src={img.image_url} 
                              alt="variant"
                              className="w-full h-full object-cover rounded-2xl border border-slate-100 shadow-sm" 
                            />
                            {isEditing && (
                              <button 
                                onClick={() => handleDeleteImage(vIdx, img.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg transform scale-0 group-hover:scale-100 transition-transform hover:bg-red-600"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        ))}

                        {/* New Image Previews */}
                        {isEditing && selectedFiles[variant.id] && selectedFiles[variant.id].map((file: File, fIdx: number) => (
                          <div key={`new-${fIdx}`} className="relative group aspect-square">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt="new variant"
                              className="w-full h-full object-cover rounded-2xl border-2 border-emerald-400 shadow-sm" 
                            />
                            <div className="absolute top-1 left-1 bg-emerald-500 text-[8px] text-white px-1.5 rounded font-bold uppercase">New</div>
                            <button 
                              onClick={() => handleDeleteNewImage(variant.id, fIdx)}
                              className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 hover:bg-slate-900 transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}

                        {/* Add Image Button */}
                        {isEditing && (
                          <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all group text-center p-2">
                            <Plus size={20} className="text-slate-300 group-hover:text-indigo-400" />
                            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase group-hover:text-indigo-400">Add Image</span>
                            <input 
                              type="file"
                              className="hidden"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length > 0) {
                                  setSelectedFiles((prev: any) => ({
                                    ...prev,
                                    [variant.id]: [...(prev[variant.id] || []), ...files]
                                  }));
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ✅ CUSTOMIZATIONS SECTION */}
              <div className="space-y-4">
                <div className="flex justify-between items-center ml-2">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                    <Layers className="text-emerald-500" /> Customizations ({product.customizations?.length || 0})
                  </h2>
                </div>

                {(!product.customizations || product.customizations.length === 0) ? (
                  <div className="bg-white p-8 rounded-3xl text-center text-slate-500 border border-slate-200">
                    <Layers size={40} className="mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No customizations applied yet</p>
                    <button
                      onClick={() => navigate(`/customize/${product.id}`)}
                      className="mt-4 bg-emerald-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-emerald-700 transition-all text-sm"
                    >
                      + Add Customization
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.customizations.map((custom: any, cIdx: number) => (
                      <div
                        key={custom.id || cIdx}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex gap-4 items-start"
                      >
                        {/* Logo preview */}
                        <div className="w-20 h-20 flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                          {custom.logo_image_url ? (
                            <img
                              src={custom.logo_image_url}
                              alt={custom.name}
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <Layers size={24} className="text-slate-300" />
                          )}
                        </div>

                        {/* Details */}
                        {/* Details */}
<div className="flex-1 min-w-0">
  <div className="flex items-start justify-between gap-2 mb-3">
    <div>
      <h4 className="font-bold text-slate-800 text-sm">
        {custom.name || `Customization #${cIdx + 1}`}
      </h4>
      <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
        #{custom.id}
      </span>
    </div>

    {/* ✅ DELETE BUTTON */}
    <button
      onClick={() => handleDeleteCustomization(custom.id)}
      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete Customization"
    >
      <Trash2 size={16} />
    </button>
  </div>

  <div className="space-y-1.5">
    {/* ... (Position and Size info same as before) */}
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
        <MapPin size={9} /> Position
      </span>
      <span className="text-xs font-mono text-slate-600">
        X: {parseFloat(custom.pos_x).toFixed(1)}% · Y: {parseFloat(custom.pos_y).toFixed(1)}%
      </span>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
        <Ruler size={9} /> Size
      </span>
      <span className="text-xs font-mono text-slate-600">
        W: {parseFloat(custom.logo_width).toFixed(1)}% · H: {parseFloat(custom.logo_height).toFixed(1)}%
      </span>
    </div>
  </div>
</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* ✅ RIGHT COLUMN: SIDEBAR STATS */}
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-6 text-slate-800 border-b border-slate-100 pb-4">Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Status</label>
                    {isEditing ? (
                      <select
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editForm.is_active ? 1 : 0}
                        onChange={(e) => setEditForm({...editForm, is_active: Boolean(Number(e.target.value))})}
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    ) : (
                      <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black ${product.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {product.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Visibility</label>
                    {isEditing ? (
                      <select 
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editForm.is_public ? 1 : 0}
                        onChange={(e) => setEditForm({...editForm, is_public: Boolean(Number(e.target.value))})}
                      >
                        <option value={1}>Public</option>
                        <option value={0}>Private</option>
                      </select>
                    ) : (
                      <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black ${product.is_public ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {product.is_public ? 'PUBLIC' : 'PRIVATE'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Featured</label>
                    {isEditing ? (
                      <select
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        value={editForm.is_featured ? 1 : 0}
                        onChange={(e) => setEditForm({...editForm, is_featured: Boolean(Number(e.target.value))})}
                      >
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                      </select>
                    ) : (
                      <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black ${product.is_featured ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                        {product.is_featured ? 'FEATURED' : 'NOT FEATURED'}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-bold mb-6">Metadata</h3>
                <div className="space-y-5 opacity-90">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Created By</p>
                    <p className="text-lg font-semibold">{product.creator_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Last Updated</p>
                    <p className="font-mono text-sm">
                      {product.updated_at 
                        ? new Date(product.updated_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Category</p>
                    <p className="text-sm">{product.category_name} / {product.subcategory_name}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductDetails;