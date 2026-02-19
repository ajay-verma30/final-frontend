import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  ArrowLeft, Plus, Trash2, Globe, Lock, Loader2, 
  Image as ImageIcon, Palette, Calendar, Building2, X, ExternalLink 
} from "lucide-react";

// Types matching your API response
interface LogoVariant {
  id: number;
  color: string;
  image_url: string;
  created_at: string;
}

interface LogoData {
  id: number;
  title: string;
  org_id: number | null;
  is_public: 0 | 1;
  organization_name: string;
  variants: LogoVariant[];
  created_at: string;
}

const LogoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // URL se logo ID lega
  const navigate = useNavigate();
  
  // States
  const [logo, setLogo] = useState<LogoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingVariantId, setDeletingVariantId] = useState<number | null>(null);

  // Form States
  const [color, setColor] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 1. Fetch Logo Details (Using route: GET /api/logos/:id)
  const fetchLogoDetails = async () => {
    try {
      const res = await api.get(`/api/logos/${id}`); // Note: Plural as per your route
      setLogo(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLogoDetails();
  }, [id]);

  // 2. Add Variant (Using route: POST /api/logos/logo/variants)
  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !color) return alert("Fill all fields");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("logo_id", id!);
    formData.append("color", color);
    formData.append("image", selectedFile);

    try {
      // Endpoint matched with your backend routes
      await api.post("/api/logos/logo/variants", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowModal(false);
      setColor("");
      setSelectedFile(null);
      fetchLogoDetails(); // List refresh
    } catch (err) {
      alert("Failed to upload variant");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Delete Variant (Using route: DELETE /api/logos/variant/:id)
  const handleDeleteVariant = async (variantId: number) => {
    if (!window.confirm("Delete this color variant?")) return;

    setDeletingVariantId(variantId);
    try {
      await api.delete(`/api/logos/variant/${variantId}`);
      fetchLogoDetails(); // Data refresh after delete
    } catch (err) {
      alert("Error deleting variant");
    } finally {
      setDeletingVariantId(null);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  if (!logo) return <div className="p-10 text-center font-bold">Logo not found!</div>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />
        <main className="p-8 overflow-y-auto">
          
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate("/logos")} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-all">
              <ArrowLeft size={18} /> Back
            </button>
            <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              <Plus size={18} /> Add Variant
            </button>
          </div>

          {/* Logo Info Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 mb-8 shadow-sm">
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 p-4">
                {logo.variants[0] ? <img src={logo.variants[0].image_url} className="object-contain w-full h-full" alt="Main" /> : <ImageIcon className="text-slate-200" />}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800">{logo.title}</h1>
                <div className="flex gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full"><Building2 size={12}/> {logo.organization_name}</span>
                  {logo.is_public ? <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1"><Globe size={12}/> Public</span> : <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1"><Lock size={12}/> Private</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Variants Grid */}
          <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Palette className="text-indigo-500" /> Color Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {logo.variants.map((variant) => (
              <div key={variant.id} className="group bg-white rounded-2xl border border-slate-200 p-3 hover:shadow-xl transition-all duration-300">
                <div className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center p-6 relative mb-3 border border-slate-50">
                  <img src={variant.image_url} alt={variant.color} className="object-contain w-full h-full max-h-16 group-hover:scale-110 transition-transform duration-500" />
                  <a href={variant.image_url} target="_blank" rel="noreferrer" className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><ExternalLink size={12} /></a>
                </div>
                <div className="flex justify-between items-center px-1">
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Variant</p>
                    <h4 className="font-bold text-slate-700 text-xs truncate capitalize">{variant.color}</h4>
                  </div>
                  <button 
                    onClick={() => handleDeleteVariant(variant.id)}
                    disabled={deletingVariantId === variant.id}
                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    {deletingVariantId === variant.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal - Simplified */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">Add Variant</h2>
              <X className="cursor-pointer text-slate-400" onClick={() => setShowModal(false)} />
            </div>
            <form onSubmit={handleAddVariant} className="space-y-4">
              <input type="text" placeholder="Color Name" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none font-bold" value={color} onChange={(e) => setColor(e.target.value)} required />
              <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 font-bold" required />
              <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black shadow-lg hover:bg-indigo-700 transition-all">
                {submitting ? <Loader2 className="animate-spin mx-auto" /> : "Save Variant"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoDetails;