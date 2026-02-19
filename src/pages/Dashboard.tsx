import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import { DollarSign, ShoppingBag, Users, Building2, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();
  
  // States for Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [totalOrgs, setTotalOrgs] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. General Stats Fetching (Users, Products, Orders, Revenue)
        const statsRes = await api.get("/api/stats/dashboard-stats");
        setStats(statsRes.data.data);

        // 2. Total Orgs Fetching (Only for SUPER ADMIN)
        if (role === "SUPER") {
          const orgRes = await api.get("/api/organizations/stats");
          setTotalOrgs(orgRes.data.data.totalOrganizations);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role]);

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-grow overflow-y-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
            <p className="text-slate-500">Welcome back! Here's what's happening in your {role === "SUPER" ? "platform" : "organization"}.</p>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* 1. Total Organizations (SUPER ADMIN ONLY) */}
            {role === "SUPER" && (
              <StatCard 
                title="Total Organizations" 
                value={loading ? "..." : totalOrgs} 
                icon={<Building2 size={24} />} 
                color="blue"
              />
            )}

            {/* 2. Total Revenue */}
            <StatCard 
              title="Total Revenue" 
              value={loading ? "..." : formatCurrency(stats.totalRevenue)} 
              icon={<DollarSign size={24} />} 
              color="emerald"
            />

            {/* 3. Total Orders */}
            <StatCard 
              title="Total Orders" 
              value={loading ? "..." : stats.totalOrders} 
              icon={<ShoppingBag size={24} />} 
              color="orange"
            />

            {/* 4. Total Customers / Users */}
            <StatCard 
              title="Total Users" 
              value={loading ? "..." : stats.totalUsers} 
              icon={<Users size={24} />} 
              color="purple"
            />

            {/* 5. Total Products (Extra Card) */}
            <StatCard 
              title="Total Products" 
              value={loading ? "..." : stats.totalProducts} 
              icon={<Package size={24} />} 
              color="rose"
            />
          </div>

          {/* Future Section: Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-100 min-h-[300px] flex items-center justify-center text-slate-400 italic shadow-sm">
              Sales Analytics Chart (Coming Soon)
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-100 min-h-[300px] flex items-center justify-center text-slate-400 italic shadow-sm">
              Recent Activity Table (Coming Soon)
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;