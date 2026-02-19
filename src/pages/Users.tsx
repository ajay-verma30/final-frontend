import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { 
  Trash2, Loader2, X, Users as UsersIcon, 
  Mail, ShieldCheck, Building2, UserPlus, UserCircle, Edit3, AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// 1. Types
interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  org_id: number | null;
  org_name: string | null;
}

const Users: React.FC = () => {
  const { user: currentUser } = useAuth(); // Logged-in user ki details
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "ENDUSER",
    org_id: ""
  });

  // ✅ FETCH USERS
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/users/all-users");
      setUsers(res.data);
    } catch (err: any) {
      console.error("Failed to fetch users", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ RESET FORM
  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      role: "ENDUSER",
      org_id: ""
    });
    setIsEditMode(false);
    setSelectedUserId(null);
  };

  // ✅ OPEN MODAL FOR CREATE
  const handleOpenCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  // ✅ HANDLE EDIT CLICK
  const handleEditClick = (u: UserData) => {
    setSelectedUserId(u.id);
    setFormData({
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      role: u.role,
      org_id: u.org_id?.toString() || ""
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  // ✅ HANDLE FORM SUBMIT (CREATE OR UPDATE)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && selectedUserId) {
        // ✅ UPDATE USER (PUT)
        await api.put(`/api/users/${selectedUserId}`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          role: formData.role,
          org_id: formData.org_id ? parseInt(formData.org_id) : null
        });
        alert("User updated successfully!");
      } else {
        // ✅ CREATE USER (POST)
        await api.post("/api/users", {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          role: formData.role,
          org_id: formData.org_id ? parseInt(formData.org_id) : null
        });
        alert("User created! Invitation sent.");
      }
      
      setShowModal(false);
      resetForm();
      fetchUsers(); // Refresh list
    } catch (err: any) {
      console.error("Operation failed:", err);
      const errorMsg = err.response?.data?.message || "Operation failed";
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ HANDLE DELETE
  const handleDelete = async (id: number, firstName: string) => {
    if (id === currentUser?.id) {
      alert("You cannot delete your own account");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${firstName}?`)) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      alert("User deleted successfully");
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ CLOSE MODAL
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-grow overflow-y-auto px-6 md:px-8 py-8 font-sans">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg text-white">
                  <UsersIcon size={28} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">User Management</h1>
                  <p className="text-slate-500 font-medium text-sm md:text-base">Manage team members and permissions</p>
                </div>
              </div>

              {(currentUser?.role === 'SUPER' || currentUser?.role === 'ADMIN') && (
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 transform hover:scale-105 duration-200"
                >
                  <UserPlus size={20} /> Add New User
                </button>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                <p className="text-slate-500 font-medium">Fetching users...</p>
              </div>
            ) : users.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-slate-100 rounded-full">
                    <UsersIcon size={32} className="text-slate-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No users yet</h3>
                <p className="text-slate-500 mb-6">Start by adding your first team member</p>
                {(currentUser?.role === 'SUPER' || currentUser?.role === 'ADMIN') && (
                  <button
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all"
                  >
                    <UserPlus size={18} /> Add First User
                  </button>
                )}
              </div>
            ) : (
              // Users Table
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">User Details</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Organization</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {users.map((u, idx) => (
                        <tr 
                          key={u.id} 
                          className="hover:bg-indigo-50 transition-colors duration-150"
                          style={{
                            animation: `slideIn 0.4s ease-out ${idx * 0.05}s both`
                          }}
                        >
                          {/* User Details */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {u.first_name.charAt(0)}{u.last_name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{u.first_name} {u.last_name}</div>
                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                  <Mail size={14} /> {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                              u.role === 'SUPER' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              u.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              <ShieldCheck size={14} /> {u.role}
                            </span>
                          </td>

                          {/* Organization */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <Building2 size={16} className="text-slate-400 flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-slate-700">
                                  {u.org_name || (u.role === 'SUPER' ? "System Wide" : "No Organization")}
                                </div>
                                {u.org_id && (
                                  <div className="text-[11px] text-slate-400">
                                    ID: {u.org_id}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-2">
                              {/* Edit Button - only if user can edit */}
                              {(currentUser?.role === 'SUPER' || (currentUser?.role === 'ADMIN' && u.org_id === currentUser?.org_id)) && (
                                <button
                                  onClick={() => handleEditClick(u)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                                  title="Edit User"
                                >
                                  <Edit3 size={18} />
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(u.id, u.first_name)}
                                disabled={u.id === currentUser?.id || deletingId === u.id}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                title={u.id === currentUser?.id ? "Cannot delete your own account" : "Delete User"}
                              >
                                {deletingId === u.id ? (
                                  <Loader2 className="animate-spin" size={18} />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Total <span className="font-semibold text-slate-900">{users.length}</span> user{users.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CREATE/EDIT USER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
            style={{
              animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 md:px-8 py-6 flex items-center justify-between text-white">
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditMode ? 'Edit User' : 'Add New User'}
                </h2>
                <p className="text-indigo-100 text-sm mt-1">
                  {isEditMode ? 'Update user information' : 'Setup a new team member account'}
                </p>
              </div>
              <button 
                onClick={handleCloseModal} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 md:p-8 space-y-5">
              
              {/* First & Last Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={isEditMode} // Email cannot be changed in edit mode
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="john@example.com"
                />
                {isEditMode && (
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                )}
              </div>

              {/* Role & Organization Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="ENDUSER">Enduser</option>
                    <option value="ADMIN">Admin</option>
                    {currentUser?.role === 'SUPER' && <option value="SUPER">Super</option>}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Organization ID
                  </label>
                  <input
                    type="number"
                    disabled={currentUser?.role !== 'SUPER'}
                    value={
                      currentUser?.role === 'ADMIN' && !isEditMode
                        ? currentUser.org_id || ""
                        : formData.org_id
                    }
                    onChange={(e) => setFormData({...formData, org_id: e.target.value})}
                    placeholder={currentUser?.role === 'ADMIN' ? "Your Org" : "Org ID"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {currentUser?.role === 'ADMIN' && (
                    <p className="text-xs text-slate-500">Your organization ID</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex gap-3 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg font-bold py-3 flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-70 transform active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditMode ? 'Update User' : 'Send Invite'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🎬 Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Users;