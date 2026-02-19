import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Users, UserPlus, Trash2, ArrowLeft, Loader2, Search } from 'lucide-react';

const GroupDetails: React.FC = () => {
  const { id } = useParams(); // Group ID from URL
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [remainingUsers, setRemainingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState(""); // For current members table
  const [addSearch, setAddSearch] = useState(""); // For add member modal

  // 1. Fetch Group Info & Current Members
  const fetchData = async () => {
    try {
      setLoading(true);
      const groupRes = await api.get(`/api/groups/${id}`);
      setGroup(groupRes.data.data);
      
      const membersRes = await api.get(`/api/groups/${id}/members`);
      setMembers(membersRes.data.data);
      const usersRes = await api.get(`/api/users/all-users?orgId=${groupRes.data.data.org_id}&excludeGroupId=${id}`);
      setRemainingUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // Member ko group se hatana
  const removeMember = async (userId: number) => {
    if (!window.confirm("Remove this user from group?")) return;
    try {
      await api.delete(`/api/groups/${id}/members/${userId}`);
      fetchData(); 
    } catch (err) { alert("Failed to remove member"); }
  };

  // Naya member add karna
const addMember = async (userId: number) => {
  try {
    await api.post(`/api/groups/${id}/members`, { 
      userIds: [userId] 
    });
    
    setAddSearch("");
    fetchData(); 
  } catch (err) { 
    alert("Failed to add member"); 
  }
};
  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />
        <main className="p-8 overflow-y-auto">
          {/* Back Button & Header */}
          <button onClick={() => navigate('/groups')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
            <ArrowLeft size={20} /> Back to Groups
          </button>

          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-800">{group?.name}</h1>
              <p className="text-slate-500">{group?.description}</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all"
            >
              <UserPlus size={18} /> Add Member
            </button>
          </div>

          {/* Current Members Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-700">Group Members ({members.length})</h3>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search members..." 
                        className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                    />
                </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {members.filter(m => `${m.first_name} ${m.last_name}`.toLowerCase().includes(memberSearch.toLowerCase())).map(member => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{member.first_name} {member.last_name}</td>
                    <td className="px-6 py-4 text-slate-500">{member.email}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => removeMember(member.id)} className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* MODAL: Remaining Users List */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 flex flex-col max-h-[70vh]">
            <h2 className="text-xl font-bold mb-4">Add Users to {group?.name}</h2>
            <input 
                type="text" 
                placeholder="Search remaining users..." 
                className="w-full p-3 bg-slate-100 rounded-xl mb-4 outline-none" 
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
            />
            
            <div className="flex-grow overflow-y-auto pr-2 space-y-2">
                {remainingUsers
                  .filter(u => `${u.first_name} ${u.last_name}`.toLowerCase().includes(addSearch.toLowerCase()))
                  .map(user => (
                    <div key={user.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-slate-700">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                        <button 
                            onClick={() => addMember(user.id)}
                            className="bg-indigo-100 text-indigo-600 p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                        >
                            <UserPlus size={16} />
                        </button>
                    </div>
                ))}
                {remainingUsers.length === 0 && <p className="text-center text-slate-400 text-sm py-4">All users are already in this group.</p>}
            </div>
            
            <button onClick={() => setIsModalOpen(false)} className="mt-6 w-full py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;