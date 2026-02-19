import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StripeWrapper from '../components/StripeWrapper';
import {
  Ticket, Plus, Users, DollarSign,
  Send, Loader2, X, Building2, CheckCircle2, ArrowLeft, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Modal has two steps:
// 'form'    → user fills campaign details
// 'payment' → Stripe checkout shown after PaymentIntent created
type ModalStep = 'form' | 'payment';

const Coupons: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [batches, setBatches] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchingGroups, setFetchingGroups] = useState(false);

  // Stripe state
  const [modalStep, setModalStep] = useState<ModalStep>('form');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const isSuper = user.role === 'SUPER';

  const emptyForm = {
    name: '',
    description: '',
    amount: '',
    group_id: '',
    org_id: isSuper ? '' : user.org_id,
  };
  const [formData, setFormData] = useState(emptyForm);

  // ── On mount: check if Stripe redirected back with payment_success ──────────
  useEffect(() => {
    if (searchParams.get('payment_success') === 'true') {
      setPaymentSuccess(true);
      // Remove the query param so refresh doesn't retrigger
      setSearchParams({});
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setFetchingData(true);
    try {
      const batchRes = await api.get('/api/coupons/batches');
      setBatches(batchRes.data.data);

      if (isSuper) {
        const orgRes = await api.get('/api/organizations');
        setOrganizations(orgRes.data.data.organizations || []);
      } else {
        const groupRes = await api.get(`/api/groups?org_id=${user.org_id}`);
        setGroups(groupRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOrgChange = async (orgId: string) => {
    setFormData(prev => ({ ...prev, org_id: orgId, group_id: '' }));
    setGroups([]);
    if (!orgId) return;
    setFetchingGroups(true);
    try {
      const groupRes = await api.get(`/api/groups?org_id=${orgId}`);
      setGroups(groupRes.data.data);
    } catch (err) {
      console.error('Error fetching groups for org', err);
    } finally {
      setFetchingGroups(false);
    }
  };

  const handleOpenModal = () => {
    setFormData(emptyForm);
    setModalStep('form');
    setClientSecret('');
    if (isSuper) setGroups([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalStep('form');
    setClientSecret('');
  };

  // Step 1: Validate form → create PaymentIntent → move to payment step
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuper && !formData.org_id) return alert('Please select an organization');
    if (!formData.group_id) return alert('Please select a target group');
    if (!formData.amount || Number(formData.amount) <= 0) return alert('Please enter a valid amount');

    setLoading(true);
    try {
      // Ask backend to create a Stripe PaymentIntent
      // Backend should return { clientSecret: 'pi_xxx_secret_xxx' }
      const res = await api.post('/api/coupons/initiate-payment', {
        name: formData.name,
        description: formData.description,
        amount: formData.amount,
        org_id: formData.org_id || user.org_id,
        group_id: formData.group_id,
      });
      setClientSecret(res.data.clientSecret);
      setModalStep('payment');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  // Payment confirmed — do NOT call any backend here.
  // The Stripe webhook (payment_intent.succeeded) handles coupon distribution.
  // Just close the modal and show the success banner.
  const handlePaymentSuccess = () => {
    handleCloseModal();
    setFormData(emptyForm);
    if (isSuper) setGroups([]);
    setPaymentSuccess(true);
    // Small delay so webhook has time to mark batch as paid before we refresh
    setTimeout(() => fetchData(), 3000);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-grow overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">

            {/* Payment success banner */}
            {paymentSuccess && (
              <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl font-bold">
                <CheckCircle2 size={20} className="shrink-0" />
                <span>Payment successful! Coupons are being distributed to the group.</span>
                <button onClick={() => setPaymentSuccess(false)} className="ml-auto text-emerald-400 hover:text-emerald-600">
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                  <Ticket className="text-indigo-600" size={32} />
                  Coupon Campaigns
                </h1>
                <p className="text-slate-500 mt-1 font-medium italic">Create and manage rewards distribution</p>
              </div>
              <button
                onClick={handleOpenModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
              >
                <Plus size={20} />
                New Campaign
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Campaign History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Campaign / Organization</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Target Group</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{batch.batch_name}</div>
                          <div className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-0.5">
                            <Building2 size={12} /> {batch.organization_name}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                            <Users size={12} /> {batch.group_name}
                          </span>
                        </td>
                        <td className="p-4 font-black text-slate-900">${batch.amount}</td>
                        <td className="p-4 text-slate-500 text-sm font-medium">
                          {new Date(batch.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-700">
                          {batch.first_name} {batch.last_name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {batches.length === 0 && !fetchingData && (
                  <div className="p-12 text-center text-slate-400 font-bold">No campaigns found.</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL ─────────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                {modalStep === 'payment' && (
                  <button
                    onClick={() => setModalStep('form')}
                    className="p-1.5 hover:bg-slate-200 rounded-full transition-colors mr-1"
                    title="Back to form"
                  >
                    <ArrowLeft size={20} className="text-slate-500" />
                  </button>
                )}
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  {modalStep === 'form'
                    ? <><Ticket className="text-indigo-600" /> New Coupon Batch</>
                    : <><CreditCard className="text-indigo-600" /> Complete Payment</>
                  }
                </h2>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2 px-8 pt-6">
              <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${modalStep === 'form' ? 'text-indigo-600' : 'text-emerald-500'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black ${modalStep === 'form' ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
                  {modalStep === 'payment' ? '✓' : '1'}
                </div>
                Campaign Details
              </div>
              <div className="flex-1 h-px bg-slate-200 mx-2" />
              <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${modalStep === 'payment' ? 'text-indigo-600' : 'text-slate-300'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black ${modalStep === 'payment' ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  2
                </div>
                Payment
              </div>
            </div>

            <div className="p-8">
              {/* ── STEP 1: Campaign Form ── */}
              {modalStep === 'form' && (
                <form onSubmit={handleFormSubmit} className="space-y-6">

                  {isSuper && (
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
                        Target Organization
                      </label>
                      <select
                        required
                        value={formData.org_id}
                        onChange={(e) => handleOrgChange(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-bold"
                      >
                        <option value="">Select Organization</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Campaign Name</label>
                      <input
                        type="text" required placeholder="Summer Sale 2024"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
                        Target Group
                        {isSuper && !formData.org_id && (
                          <span className="ml-2 normal-case font-medium text-slate-300">(select an org first)</span>
                        )}
                      </label>
                      <div className="relative">
                        <select
                          required
                          disabled={isSuper && (!formData.org_id || fetchingGroups)}
                          value={formData.group_id}
                          onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <option value="">{fetchingGroups ? 'Loading groups...' : 'Select User Group'}</option>
                          {groups.map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                        {fetchingGroups && (
                          <Loader2 size={16} className="animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                        )}
                      </div>
                      {isSuper && formData.org_id && !fetchingGroups && groups.length === 0 && (
                        <p className="text-xs text-amber-500 font-bold mt-1">No groups found for this organization.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Coupon Amount ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="number" required placeholder="50.00" min="1"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-black text-indigo-600 text-xl"
                      />
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:bg-slate-300"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
                    {loading ? 'Preparing Payment...' : 'Continue to Payment'}
                  </button>
                </form>
              )}

              {/* ── STEP 2: Stripe Payment ── */}
              {modalStep === 'payment' && clientSecret && (
                <div className="space-y-4">
                  {/* Summary pill */}
                  <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3">
                    <div className="text-sm text-slate-600 font-medium">
                      Campaign: <span className="font-black text-slate-900">{formData.name}</span>
                    </div>
                    <div className="text-lg font-black text-indigo-600">${formData.amount}</div>
                  </div>

                  <StripeWrapper
                    clientSecret={clientSecret}
                    amount={formData.amount}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;