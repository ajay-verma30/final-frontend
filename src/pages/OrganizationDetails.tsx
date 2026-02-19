import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  Building2, Palette, Layout, 
  ArrowLeft, Save, Loader2, Upload, X
} from 'lucide-react';

const OrganizationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  // Single State for all fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    is_active: 1,
    branding: {
      logo_url: '',
      favicon_url: '',
      primary_color: '#6366f1',
      secondary_color: '#94a3b8',
      sidebar_color: '#111827',
      navbar_color: '#ffffff',
      font_family: 'Inter, Sans-serif'
    }
  });

  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        const res = await api.get(`/api/organizations/${id}`);
        const data = res.data.data;
        setFormData({
          name: data.name,
          phone: data.phone || '',
          is_active: data.is_active,
          branding: {
            logo_url: data.logo_url || '',
            favicon_url: data.favicon_url || '',
            primary_color: data.primary_color || '#6366f1',
            secondary_color: data.secondary_color || '#94a3b8',
            sidebar_color: data.sidebar_color || '#111827',
            navbar_color: data.navbar_color || '#ffffff',
            font_family: data.font_family || 'Inter, Sans-serif'
          }
        });
        setLogoPreview(data.logo_url || '');
      } catch (err) {
        console.error("Failed to fetch org", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgDetails();
  }, [id]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      // Always send as multipart/form-data so Multer can handle
      // req.file (logo) and req.body (everything else) in one request.
      const payload = new FormData();

      payload.append('name', formData.name);
      payload.append('phone', formData.phone);
      payload.append('is_active', String(formData.is_active));

      // Backend service reads data.branding as a JSON string:
      // `typeof data.branding === 'string' ? JSON.parse(data.branding) : data.branding`
      payload.append('branding', JSON.stringify(formData.branding));

      // Attach file under key 'logo' — matches upload.single('logo') in the route
      if (logoFile) {
        payload.append('logo', logoFile);
      }

      await api.put(`/api/organizations/update/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("Organization details updated successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogoFileChange = (file: File) => {
    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    updateBranding('logo_url', objectUrl);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    updateBranding('logo_url', '');
  };

  // Helper to update branding nested state
  const updateBranding = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      branding: { ...prev.branding, [field]: value }
    }));
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-grow overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => navigate('/organizations')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
                <ArrowLeft size={20} /> Back
              </button>
              <button 
                onClick={handleUpdate}
                disabled={updating}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-slate-300"
              >
                {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Branding Preview */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 text-center">
                  <div className="w-32 h-32 mx-auto rounded-3xl bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden mb-4 relative group">
                    {logoPreview ? (
                      <img src={logoPreview} alt="logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 size={48} className="text-slate-300" />
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">{formData.name}</h2>
                  <div className="mt-4 flex flex-col gap-2">
                     <label className="flex items-center justify-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.is_active === 1} 
                          onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-sm font-bold text-slate-700">Organization Active</span>
                     </label>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Palette size={18} className="text-indigo-400" /> Theme Preview
                  </h3>
                  <div className="space-y-3">
                    <ColorPreview label="Primary" color={formData.branding.primary_color} />
                    <ColorPreview label="Secondary" color={formData.branding.secondary_color} />
                    <ColorPreview label="Sidebar" color={formData.branding.sidebar_color} />
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Layout className="text-indigo-600" /> Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Organization Name" value={formData.name} onChange={(val:any) => setFormData({...formData, name: val})} />
                    <InputField label="Phone Number (+1-XXX-XXX-XXXX)" value={formData.phone} onChange={(val:any) => setFormData({...formData, phone: val})} />
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Palette className="text-indigo-600" /> Branding Config
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FileUploadInput
                        label="Logo"
                        preview={logoPreview}
                        fileName={logoFile?.name}
                        onFileChange={handleLogoFileChange}
                        onRemove={handleRemoveLogo}
                      />
                      <InputField label="Favicon URL" placeholder="https://..." value={formData.branding.favicon_url} onChange={(val:any) => updateBranding('favicon_url', val)} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <ColorInput label="Primary" value={formData.branding.primary_color} onChange={(val:any) => updateBranding('primary_color', val)} />
                      <ColorInput label="Secondary" value={formData.branding.secondary_color} onChange={(val:any) => updateBranding('secondary_color', val)} />
                      <ColorInput label="Sidebar" value={formData.branding.sidebar_color} onChange={(val:any) => updateBranding('sidebar_color', val)} />
                      <ColorInput label="Navbar" value={formData.branding.navbar_color} onChange={(val:any) => updateBranding('navbar_color', val)} />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Typography</label>
                      <select 
                        value={formData.branding.font_family}
                        onChange={(e) => updateBranding('font_family', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-600"
                      >
                        <option value="Inter, Sans-serif">Inter (Default)</option>
                        <option value="Poppins, sans-serif">Poppins</option>
                        <option value="Roboto, sans-serif">Roboto</option>
                        <option value="Montserrat, sans-serif">Montserrat</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// --- Updated UI Components with onChange ---

const InputField = ({ label, placeholder, value, onChange }: any) => (
  <div>
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
    <input 
      type="text" 
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-medium"
    />
  </div>
);

const ColorInput = ({ label, value, onChange }: any) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
    <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent" 
      />
      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{value}</span>
    </div>
  </div>
);

const ColorPreview = ({ label, color }: any) => (
  <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
    <span className="text-xs font-bold text-slate-400">{label}</span>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: color }}></div>
      <span className="text-[10px] font-mono">{color}</span>
    </div>
  </div>
);

const FileUploadInput = ({ label, preview, fileName, onFileChange, onRemove }: any) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) onFileChange(file);
  };

  return (
    <div>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !preview && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl transition-all ${!preview ? 'cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileChange(f); }}
        />
        {preview ? (
          <div className="flex items-center gap-3 w-full">
            <img src={preview} alt="logo preview" className="w-12 h-12 rounded-lg object-contain border border-slate-200 bg-white" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">{fileName || 'Current logo'}</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="text-[10px] text-red-400 hover:text-red-600 font-bold flex items-center gap-1 mt-0.5"
              >
                <X size={10} /> Remove
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-bold whitespace-nowrap"
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <Upload size={20} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 text-center">Click or drag & drop<br /><span className="font-normal">PNG, JPG, SVG, WEBP</span></span>
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizationDetails;