import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  User, Mail, Phone, Shield, Building2, Calendar, 
  CheckCircle2, Lock, Loader2, Camera, X, Save, MapPin, Plus, Trash2, AlertCircle, Edit2
} from 'lucide-react';

// Types
interface SavedAddress {
  id: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: 'HOME' | 'OFFICE' | 'OTHER';
  is_default: number;
}

interface AddressFormData {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  address_type: 'HOME' | 'OFFICE' | 'OTHER';
  is_default: number;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [showPassModal, setShowPassModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Edit states
  const [editData, setEditData] = useState({ phone: '', profile_pic_url: '' });
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  // Address states
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  
  // Form data
  const [addressFormData, setAddressFormData] = useState<AddressFormData>({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA', // Default to USA
    address_type: 'HOME',
    is_default: 0
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/users/my-profile');
      setProfile(res.data);
      setEditData({ 
        phone: res.data.user_phone || '', 
        profile_pic_url: res.data.profile_pic_url || '' 
      });
    } catch (err: any) {
      console.error("Profile failed", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ HANDLE UPDATE PROFILE
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/users/update-profile', editData);
      alert("Profile Updated!");
      setShowEditModal(false);
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  // ✅ HANDLE PASSWORD CHANGE
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passData.newPassword !== passData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (passData.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await api.post('/api/users/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      alert("Password Changed Successfully!");
      setShowPassModal(false);
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || "Error changing password");
    }
  };

  // ✅ OPEN MODAL FOR NEW ADDRESS
  const handleAddNewAddress = () => {
    setIsEditingAddress(false);
    setEditingAddressId(null);
    setAddressFormData({
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA',
      address_type: 'HOME',
      is_default: 0
    });
    setShowAddressModal(true);
  };

  // ✅ OPEN MODAL FOR EDITING ADDRESS
  const handleEditAddress = (address: SavedAddress) => {
    setIsEditingAddress(true);
    setEditingAddressId(address.id);
    setAddressFormData({
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      address_type: address.address_type,
      is_default: address.is_default
    });
    setShowAddressModal(true);
  };

  // ✅ SAVE ADDRESS (CREATE OR UPDATE)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!addressFormData.address_line1.trim()) {
      alert("Address Line 1 is required");
      return;
    }
    if (!addressFormData.city.trim()) {
      alert("City is required");
      return;
    }
    if (!addressFormData.state.trim()) {
      alert("State is required");
      return;
    }
    if (!addressFormData.zip.trim()) {
      alert("ZIP Code is required");
      return;
    }

    setSubmittingAddress(true);
    try {
      if (isEditingAddress && editingAddressId) {
        // ✅ UPDATE ADDRESS
        await api.put(`/api/users/address/${editingAddressId}`, addressFormData);
        alert("Address updated successfully!");
      } else {
        // ✅ CREATE NEW ADDRESS
        await api.post('/api/users/new-address', addressFormData);
        alert("Address added successfully!");
      }
      
      setShowAddressModal(false);
      fetchProfile();
    } catch (err: any) {
      console.error("Address save failed", err);
      alert(err.response?.data?.message || "Failed to save address");
    } finally {
      setSubmittingAddress(false);
    }
  };

  // ✅ DELETE ADDRESS
  const handleDeleteAddress = async (addressId: number, addressLine: string) => {
    if (!window.confirm(`Are you sure you want to delete this address?\n\n${addressLine}`)) {
      return;
    }

    setDeletingAddressId(addressId);
    try {
      await api.delete(`/api/users/address/${addressId}`);
      alert("Address deleted successfully!");
      fetchProfile();
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(err.response?.data?.message || "Failed to delete address");
    } finally {
      setDeletingAddressId(null);
    }
  };

  // ✅ CLOSE ADDRESS MODAL
  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setIsEditingAddress(false);
    setEditingAddressId(null);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
        <p className="text-slate-600 font-medium">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-grow overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* 1. HEADER */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-8 relative">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-100 to-slate-100 border-4 border-white shadow-xl overflow-hidden">
                  <img 
                    src={profile.profile_pic_url || `https://ui-avatars.com/api/?name=${profile.first_name}+${profile.last_name}`} 
                    className="w-full h-full object-cover" 
                    alt="Profile" 
                  />
                </div>
                <button 
                  onClick={() => setShowEditModal(true)} 
                  className="absolute -bottom-2 -right-2 p-3 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg text-white hover:scale-110 transition-transform"
                  title="Change profile picture"
                >
                  <Camera size={18} />
                </button>
              </div>

              <div className="text-center md:text-left flex-grow">
                <h1 className="text-4xl font-black text-slate-900">{profile.first_name} {profile.last_name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5"><Mail size={16}/> {profile.email}</span>
                  <span className="flex items-center gap-1.5"><Phone size={16}/> {profile.user_phone || 'No phone'}</span>
                  <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm font-bold tracking-wide">
                    <Shield size={16}/> {profile.role}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setShowEditModal(true)} 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg"
              >
                Edit Profile
              </button>
            </div>

            {/* 2. ORG & TIMELINE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Building2 className="text-indigo-600" size={24} /> Organization</h3>
                <div className="grid grid-cols-2 gap-6">
                  <DetailItem label="Org Name" value={profile.org_name} />
                  <DetailItem label="Org Slug" value={profile.org_slug} isCode />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Calendar className="text-indigo-600" size={24} /> Account Timeline</h3>
                <DetailItem label="Member Since" value={new Date(profile.member_since).toDateString()} />
              </div>
            </div>

            {/* 3. ADDRESSES SECTION */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <MapPin className="text-indigo-600" size={28} /> Saved Addresses
                </h3>
                <button 
                  onClick={handleAddNewAddress}
                  className="flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 px-5 py-3 rounded-xl transition-all shadow-lg"
                >
                  <Plus size={18} /> Add New Address
                </button>
              </div>

              {/* Address Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {profile.saved_addresses && profile.saved_addresses.length > 0 ? (
                  profile.saved_addresses.map((addr: SavedAddress) => (
                    <div 
                      key={addr.id} 
                      className={`p-6 rounded-2xl border-2 transition-all transform hover:shadow-lg ${
                        addr.is_default 
                          ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                          : 'border-slate-200 bg-white hover:border-indigo-200'
                      }`}
                    >
                      {/* Type Badge & Default Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider inline-block
                          ${addr.address_type === 'HOME' ? 'bg-blue-100 text-blue-700' : 
                            addr.address_type === 'OFFICE' ? 'bg-orange-100 text-orange-700' : 
                            'bg-purple-100 text-purple-700'}`}>
                          {addr.address_type}
                        </span>
                        {addr.is_default === 1 && (
                          <div className="flex items-center gap-1 text-indigo-600 font-bold text-xs">
                            <CheckCircle2 size={16} /> Default
                          </div>
                        )}
                      </div>

                      {/* Address Details */}
                      <p className="text-sm font-bold text-slate-900 leading-tight mb-2">{addr.address_line1}</p>
                      {addr.address_line2 && (
                        <p className="text-sm text-slate-600 mb-2">{addr.address_line2}</p>
                      )}
                      <p className="text-sm text-slate-700 font-semibold">{addr.city}, {addr.state} {addr.zip}</p>
                      <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide">{addr.country}</p>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-5 pt-5 border-t border-slate-200">
                        <button
                          onClick={() => handleEditAddress(addr)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-semibold text-sm"
                          title="Edit address"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id, addr.address_line1)}
                          disabled={deletingAddressId === addr.id}
                          className="flex-1 flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete address"
                        >
                          {deletingAddressId === addr.id ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} /> Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                    <MapPin size={40} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-semibold mb-4">No addresses saved yet</p>
                    <button
                      onClick={handleAddNewAddress}
                      className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700"
                    >
                      <Plus size={16} /> Add your first address
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 4. SECURITY */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-3 mb-2"><Lock className="text-indigo-400" size={28} /> Security</h3>
                <p className="text-slate-400">Update your password to keep your account safe and secure.</p>
              </div>
              <button 
                onClick={() => setShowPassModal(true)} 
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all whitespace-nowrap shadow-lg"
              >
                Change Password
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ============================================ */}
      {/* EDIT PROFILE MODAL */}
      {/* ============================================ */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200"
            style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Update Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={editData.phone} 
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  placeholder="+1 (XXX) XXX-XXXX"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Profile Picture URL</label>
                <input 
                  type="url" 
                  value={editData.profile_pic_url} 
                  onChange={(e) => setEditData({...editData, profile_pic_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg"
              >
                <Save size={20}/> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* PASSWORD CHANGE MODAL */}
      {/* ============================================ */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200"
            style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
              <button onClick={() => setShowPassModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password" 
                  required
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  required
                  value={passData.newPassword}
                  onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  required
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* ADDRESS MODAL (CREATE/EDIT) */}
      {/* ============================================ */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4">
              <h2 className="text-2xl font-bold text-slate-900">
                {isEditingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button onClick={handleCloseAddressModal} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-5">
              {/* Address Line 1 */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={addressFormData.address_line1}
                  onChange={(e) => setAddressFormData({...addressFormData, address_line1: e.target.value})}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Apartment, Suite, etc. (Optional)
                </label>
                <input 
                  type="text" 
                  value={addressFormData.address_line2}
                  onChange={(e) => setAddressFormData({...addressFormData, address_line2: e.target.value})}
                  placeholder="Apt 4B"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* City & State Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData({...addressFormData, city: e.target.value})}
                    placeholder="New York"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={addressFormData.state}
                    onChange={(e) => setAddressFormData({...addressFormData, state: e.target.value})}
                    placeholder="NY"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* ZIP & Country Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={addressFormData.zip}
                    onChange={(e) => setAddressFormData({...addressFormData, zip: e.target.value})}
                    placeholder="10001"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={addressFormData.country}
                    disabled
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Country is set to USA</p>
                </div>
              </div>

              {/* Address Type */}
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">
                  Address Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['HOME', 'OFFICE', 'OTHER'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressFormData({...addressFormData, address_type: type})}
                      className={`py-3 px-4 rounded-xl font-bold transition-all ${
                        addressFormData.address_type === type
                          ? 'bg-indigo-600 text-white border-2 border-indigo-600'
                          : 'bg-slate-100 text-slate-700 border-2 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set as Default */}
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <input 
                  type="checkbox"
                  checked={addressFormData.is_default === 1}
                  onChange={(e) => setAddressFormData({...addressFormData, is_default: e.target.checked ? 1 : 0})}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <label className="text-sm font-semibold text-slate-700 cursor-pointer flex-1">
                  Set as default address
                </label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={submittingAddress}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submittingAddress ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {isEditingAddress ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isEditingAddress ? 'Update Address' : 'Add Address'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* ANIMATIONS */}
      {/* ============================================ */}
      <style>{`
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

// ============================================
// Helper Component
// ============================================
const DetailItem = ({ label, value, isCode }: any) => (
  <div className="mb-4">
    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
    <p className={`font-bold ${isCode ? 'font-mono text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-sm' : 'text-lg text-slate-800'}`}>
      {value || 'N/A'}
    </p>
  </div>
);

export default Profile;