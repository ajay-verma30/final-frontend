import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  isUp?: boolean;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, isUp, color = "emerald" }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        
        {trend && (
          <p className={`text-xs mt-2 font-medium ${isUp ? "text-emerald-500" : "text-red-500"}`}>
            {isUp ? "↑" : "↓"} {trend} <span className="text-slate-400 font-normal ml-1">vs last month</span>
          </p>
        )}
      </div>

      <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;