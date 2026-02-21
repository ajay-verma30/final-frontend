import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  Pencil, Trash2, Plus, Search, Filter, Loader2,
  Building2, Globe, Phone, X, User, Lock, CheckCircle2, AlertCircle,
} from "lucide-react";

interface Organization {
  id: number;
  name: string;
  slug: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

interface FormState {
  name: string;
  phone: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const EMPTY_FORM: FormState = {
  name: "", phone: "", first_name: "", last_name: "", email: "", password: "",
};

const Organizations: React.FC = () => {
  const { user } = useAuth();
  const isSUPER = user?.role === "SUPER";

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const navigate = useNavigate();

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/organizations");
      setOrganizations(res.data.data.organizations || []);
    } catch (err) {
      console.error("Error fetching organizations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrganizations(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setCreateError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!form.name.trim())
      return setCreateError("Organization name is required.");
    if (!form.first_name.trim() || !form.last_name.trim())
      return setCreateError("Admin first and last name are required.");
    if (!form.email.trim())
      return setCreateError("Admin email is required.");
    if (!form.password || form.password.length < 8)
      return setCreateError("Admin password must be at least 8 characters.");

    setCreating(true);
    try {
      await api.post("/api/organizations", {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        admin: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          password: form.password,
        },
      });

      setCreateSuccess(true);
      fetchOrganizations();
      setTimeout(() => {
        setShowModal(false);
        setCreateSuccess(false);
        setForm(EMPTY_FORM);
      }, 1500);
    } catch (err: any) {
      // Show exact backend error message inline — no alert()
      setCreateError(err.response?.data?.message || "Failed to create organization.");
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    if (creating) return;
    setShowModal(false);
    setForm(EMPTY_FORM);
    setCreateError(null);
    setCreateSuccess(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    setDeletingId(id);
    setDeleteError(null);
    try {
      await api.delete(`/api/organizations/${id}`);
      setOrganizations((prev) => prev.filter((org) => org.id !== id));
    } catch (err: any) {
      // Show inline error — no alert()
      setDeleteError(err.response?.data?.message || "Failed to delete organization.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-grow overflow-y-auto p-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="text-indigo-600" size={28} /> Organizations
              </h1>
              <p className="text-slate-500 text-sm">Manage partner companies and their account status.</p>
            </div>

            {/* Register button — SUPER only */}
            {isSUPER && (
              <button
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-indigo-200"
                onClick={() => setShowModal(true)}
              >
                <Plus size={18} /> Register Organization
              </button>
            )}
          </div>

          {/* Inline delete error banner */}
          {deleteError && (
            <div className="flex items-center gap-3 mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="flex-1">{deleteError}</span>
              <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Organization Details</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Created Date</th>
                    {isSUPER && (
                      <th className="px-6 py-4 text-center sticky right-0 bg-slate-50 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.04)] border-l border-slate-200">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={isSUPER ? 4 : 3} className="text-center py-20">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="animate-spin text-indigo-500" size={32} />
                          <span className="text-slate-400 text-sm font-medium">Fetching organizations...</span>
                        </div>
                      </td>
                    </tr>
                  ) : organizations.length === 0 ? (
                    <tr>
                      <td colSpan={isSUPER ? 4 : 3} className="text-center py-20 text-slate-400 italic">
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
                          {new Date(org.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </td>

                        {/* Actions — SUPER only */}
                        {isSUPER && (
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
                                className={`p-2 rounded-lg transition-all border border-transparent ${
                                  deletingId === org.id
                                    ? "text-slate-200 bg-slate-100 cursor-not-allowed"
                                    : "text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
                                }`}
                                title="Delete Organization"
                              >
                                {deletingId === org.id
                                  ? <Loader2 size={18} className="animate-spin" />
                                  : <Trash2 size={18} />}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ── CREATE ORGANIZATION MODAL (SUPER only) ──────────────────────── */}
      {showModal && isSUPER && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
            style={{ animation: "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)" }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-7 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Register Organization</h2>
                  <p className="text-indigo-200 text-xs mt-0.5">Creates org + admin account, sends invite email</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
                <X size={20} />
              </button>
            </div>

            {/* Success state */}
            {createSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Organization Created!</h3>
                <p className="text-slate-500 text-sm">An invite email has been sent to the admin.</p>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="overflow-y-auto flex-1 flex flex-col">
                <div className="px-7 py-6 space-y-6 flex-1">

                  {/* Inline error banner */}
                  {createError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span className="flex-1">{createError}</span>
                      <button type="button" onClick={() => setCreateError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Organization section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                        <Building2 size={13} className="text-indigo-600" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Organization</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Organization Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text" name="name" value={form.name} onChange={handleChange}
                          placeholder="e.g. Acme Corp"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Phone{" "}
                          <span className="text-slate-400 font-normal">(Optional — format: +1-XXX-XXX-XXXX)</span>
                        </label>
                        <input
                          type="text" name="phone" value={form.phone} onChange={handleChange}
                          placeholder="+1-555-123-4567"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100" />

                  {/* Admin section */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center">
                        <User size={13} className="text-slate-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Default Admin User</span>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text" name="first_name" value={form.first_name} onChange={handleChange}
                            placeholder="John"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text" name="last_name" value={form.last_name} onChange={handleChange}
                            placeholder="Doe"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email" name="email" value={form.email} onChange={handleChange}
                          placeholder="admin@acmecorp.com"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          <Lock size={11} className="inline mr-1" />
                          Password <span className="text-red-500">*</span>
                          <span className="text-slate-400 font-normal ml-1">(min 8 chars)</span>
                        </label>
                        <input
                          type="password" name="password" value={form.password} onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-600">
                    The admin will receive an email with a link to activate their account and set their password.
                  </div>
                </div>

                {/* Footer */}
                <div className="px-7 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 flex-shrink-0">
                  <button
                    type="button" onClick={closeModal} disabled={creating}
                    className="flex-1 py-2.5 border border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={creating}
                    className="flex-[2] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 text-sm shadow-sm"
                  >
                    {creating
                      ? <><Loader2 className="animate-spin" size={16} /> Creating...</>
                      : <><Plus size={16} /> Create Organization</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Organizations;