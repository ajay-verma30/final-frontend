import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../api/axiosInstance"; 
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Pencil, Trash2, Plus, Search, Filter, Loader2, Building2, Globe, Phone } from "lucide-react";

interface Organization {
  id: number;
  name: string;
  slug: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

const Organizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null); 
  const navigate = useNavigate();

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      // API call matching your endpoint
      const res = await api.get("/api/organizations");
      // Accessing data based on your JSON structure: res.data.data.organizations
      setOrganizations(res.data.data.organizations || []);
    } catch (err) {
      console.error("Error fetching organizations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete organization "${name}"? This action might be irreversible.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/api/organizations/${id}`);       
      setOrganizations(prev => prev.filter(org => org.id !== id));
      alert("Organization deleted successfully");
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(err.response?.data?.message || "Failed to delete organization");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-grow overflow-y-auto p-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="text-indigo-600" size={28} /> Organizations
              </h1>
              <p className="text-slate-500 text-sm">Manage partner companies and their account status.</p>
            </div>
            <button 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-indigo-200"
              onClick={() => navigate(`/new-organization`)}
            >
              <Plus size={18} /> Register Organization
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Search & Filter */}
            <div className="p-4 border-b border-slate-100 flex gap-4 bg-white">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or slug..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-all font-medium">
                <Filter size={18} /> Filter
              </button>
            </div>

            <div className="overflow-x-auto relative">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Organization Details</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-center sticky right-0 bg-slate-50 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.04)] border-l border-slate-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-20">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin text-indigo-500" size={32} />
                          <span className="text-slate-400 text-sm font-medium">Fetching organizations...</span>
                        </div>
                      </td>
                    </tr>
                  ) : organizations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-20 text-slate-400 italic">
                        No organizations registered yet.
                      </td>
                    </tr>
                  ) : (
                    organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                              {org.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{org.name}</div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                <Globe size={10} /> {org.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <Phone size={14} className="text-slate-400" />
                            {org.phone || "N/A"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                          {new Date(org.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        
                        <td className="px-6 py-4 sticky right-0 bg-white group-hover:bg-slate-50 transition-colors border-l border-slate-100 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => navigate(`/organization/${org.id}`)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100/50 rounded-lg transition-all border border-transparent hover:border-indigo-200" 
                              title="Edit Organization"
                            >
                              <Pencil size={18} />
                            </button>
                            
                            <button 
                              onClick={() => handleDelete(org.id, org.name)}
                              disabled={deletingId === org.id}
                              className={`p-2 rounded-lg transition-all border border-transparent 
                                ${deletingId === org.id 
                                  ? "text-slate-200 bg-slate-100 cursor-not-allowed" 
                                  : "text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100"}`}
                              title="Delete Organization"
                            >
                              {deletingId === org.id ? (
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

export default Organizations;