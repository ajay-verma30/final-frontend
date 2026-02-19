import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  Users, Plus, Search, Trash2,
  Calendar, Loader2, Check, Pencil, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Group {
  id: number;
  name: string;
  description: string;
  created_at: string;
  org_id: number; // API response mein org_id hona chahiye
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Organization {
  id: number;
  name: string;
  slug: string;
}

const Groups: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [orgLoading, setOrgLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    userIds: [] as number[]
  });

  const [submitting, setSubmitting] = useState(false);

  // ----------------------------
  // FETCH DATA FUNCTIONS
  // ----------------------------
  const fetchGroups = async () => {
    try {
      const res = await api.get('/api/groups');
      setGroups(res.data.data);
    } catch (err) {
      console.error("Error fetching groups", err);
    }
  };

  const fetchOrganizations = async () => {
    setOrgLoading(true);
    try {
      const res = await api.get('/api/organizations');
      setOrganizations(res.data.data.organizations);
    } catch (err) {
      console.error("Error fetching organizations", err);
    } finally {
      setOrgLoading(false);
    }
  };

  const fetchUsers = async (orgId?: string | number) => {
    try {
      let url = '/api/users/all-users';
      if (user?.role === 'SUPER') {
        if (!orgId) {
          setAvailableUsers([]);
          return;
        }
        url = `/api/users/all-users?orgId=${orgId}`;
      }
      const res = await api.get(url);
      setAvailableUsers(res.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchGroups();
      if (user?.role === 'SUPER') await fetchOrganizations();
      else await fetchUsers();
      setLoading(false);
    };
    init();
  }, []);

  // Sync users when Super selects Org in Create Modal
  useEffect(() => {
    if (user?.role === 'SUPER' && selectedOrgId && isModalOpen) {
      fetchUsers(selectedOrgId);
    }
  }, [selectedOrgId, isModalOpen]);

  // ----------------------------
  // ACTIONS
  // ----------------------------
  const openEditModal = async (group: Group) => {
    setSelectedGroup(group);
    setUserSearch("");
    setSubmitting(true); // Loading members state
    try {
      // 1. Fetch users for this group's organization
      await fetchUsers(group.org_id);
      
      // 2. Fetch current members to pre-select checkboxes
      const res = await api.get(`/api/groups/${group.id}/members`);
      const currentMemberIds = res.data.data.map((m: any) => m.user_id);
      
      setNewGroup(prev => ({ ...prev, userIds: currentMemberIds }));
      setIsEditModalOpen(true);
    } catch (err) {
      alert("Failed to fetch group members");
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setNewGroup({ name: '', description: '', userIds: [] });
    setSelectedOrgId(null);
    setSelectedGroup(null);
    setUserSearch('');
  };

  const toggleUserSelection = (userId: number) => {
    setNewGroup(prev => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter(id => id !== userId)
        : [...prev.userIds, userId]
    }));
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/groups/add', {
        ...newGroup,
        org_id: user?.role === 'SUPER' ? Number(selectedOrgId) : undefined
      });
      await fetchGroups();
      resetModal();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMembers = async () => {
    if (!selectedGroup) return;
    setSubmitting(true);
    try {
      await api.put(`/api/groups/${selectedGroup.id}/members`, {
        userIds: newGroup.userIds
      });
      alert("Members updated successfully");
      resetModal();
    } catch (err) {
      alert("Failed to update members");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      await api.delete(`/api/groups/${id}`);
      setGroups(groups.filter(g => g.id !== id));
    } catch {
      alert("Failed to delete group");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />
        <main className="p-8 overflow-y-auto">
          {/* HEADER & SEARCH (Same as your code) */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-800">User Groups</h1>
              <p className="text-slate-500">Manage and segment your users effectively.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-700">
              <Plus size={18} /> Create Group
            </button>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 mb-8 flex gap-4">
             <input 
                type="text" 
                placeholder="Search groups..." 
                className="w-full p-3 bg-slate-50 rounded-xl outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          {/* TABLE SECTION */}
          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-600">Group Name</th>
                    <th className="px-6 py-4 font-bold text-slate-600">Description</th>
                    <th className="px-6 py-4 font-bold text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())).map((group) => (
                    <tr key={group.id} className="hover:bg-slate-50/80 group transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{group.name}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm truncate max-w-xs">{group.description}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button 
      onClick={() => navigate(`/groups/${group.id}`)} 
      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100"
      title="Manage Members"
    >
      <Pencil size={18} />
    </button>
                        <button 
                          onClick={() => handleDelete(group.id)}
                          className="p-2 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* --- CREATE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 flex flex-col max-h-[85vh]">
            <h2 className="text-2xl font-bold mb-6">Create Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4 flex-grow overflow-hidden flex flex-col">
              <input required placeholder="Group Name" className="w-full p-4 bg-slate-50 rounded-xl outline-none" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} />
              <textarea placeholder="Description" className="w-full p-4 bg-slate-50 rounded-xl outline-none h-24" value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} />
              
              {user?.role === 'SUPER' && (
                <select required value={selectedOrgId || ""} onChange={(e) => setSelectedOrgId(Number(e.target.value))} className="w-full p-4 bg-slate-50 rounded-xl outline-none">
                  <option value="">Select Organization</option>
                  {organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                </select>
              )}

              <div className="flex flex-col flex-grow overflow-hidden">
                <p className="font-bold mb-2 text-sm text-slate-600">Select Users</p>
                <input type="text" placeholder="Filter users..." className="p-2 mb-2 bg-slate-100 rounded-lg text-sm" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                <div className="flex-grow overflow-y-auto pr-2 space-y-1 bg-slate-50 rounded-xl p-2 border border-slate-100">
                   {availableUsers.filter(u => `${u.first_name} ${u.last_name}`.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                      <div key={u.id} onClick={() => toggleUserSelection(u.id)} className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all ${newGroup.userIds.includes(u.id) ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100'}`}>
                        <span className="text-sm font-medium">{u.first_name} {u.last_name}</span>
                        {newGroup.userIds.includes(u.id) && <Check size={14} />}
                      </div>
                   ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t mt-auto">
                <button type="button" onClick={resetModal} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;