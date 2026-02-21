import React, { useState } from "react";
import { 
  Building2, Users, Package, Layers, 
  Image as ImageIcon, MessageSquare, 
  ChevronDown, LayoutDashboard, BadgeDollarSign
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role?.toUpperCase();
  console.log(user)
  const orgId = user?.org_id;

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-slate-300 flex flex-col shadow-xl">

      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500 rounded-lg">
             <LayoutDashboard size={20} className="text-white" />
          </div>
          {role === "SUPER" ? "Super Admin" : "Admin Panel"}
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
        
        {/* 🔹 Common Dashboard Option (For All Roles) */}
        <SidebarItem 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          onClick={() => navigate("/dashboard")} 
        />

        <div className="my-4 border-t border-slate-800/50"></div>

        {/* --- SUPER ADMIN ONLY --- */}
        {role === "SUPER" && (
          <>
            <SidebarItem icon={<Building2 size={20} />} label="Organizations" onClick={() => navigate("/organizations")} />

            <SidebarDropdown 
              title="Users and Groups" 
              icon={<Users size={20} />}
              items={[
                { label: "Users", onClick: () => navigate("/users") },
                { label: "Groups", onClick: () => navigate("/groups") }
              ]}
            />
            <SidebarItem icon={<BadgeDollarSign size={20} />} label="Coupons" onClick={() => navigate("/coupons")} />

            <SidebarDropdown 
              title="Products" 
              icon={<Package size={20} />}
              items={[
                { label: "Products", onClick: () => navigate("/all-products") }
              ]}
            />

            <SidebarDropdown 
              title="Categories" 
              icon={<Layers size={20} />}
              items={[
                { label: "Categories", onClick: () => navigate("/categories") },
                { label: "Sub Categories", onClick: () => navigate("/sub-categories") }
              ]}
            />

            <SidebarItem icon={<ImageIcon size={20} />} label="Logos" onClick={() => navigate("/logos")} />
            <SidebarItem icon={<MessageSquare size={20} />} label="Communications" onClick={() => navigate("/communications")} />
          </>
        )}

        {/* --- ADMIN ONLY --- */}
        {role === "ADMIN" && (
          <>
            <SidebarItem icon={<Building2 size={20} />} label="My Organization" onClick={() => navigate(`/organization/${orgId}`)} />

            <SidebarDropdown 
              title="Users and Groups" 
              icon={<Users size={20} />}
              items={[
                { label: "Users", onClick: () => navigate("/users") },
                { label: "Groups", onClick: () => navigate("/groups") },
              ]}
            />

            <SidebarItem icon={<BadgeDollarSign size={20} />} label="Coupons" onClick={() => navigate("/coupons")} />


            <SidebarDropdown 
              title="Products" 
              icon={<Package size={20} />}
              items={[
                { label: "Products", onClick: () => navigate("/all-products") }
              ]}
            />

            <SidebarDropdown 
              title="Categories" 
              icon={<Layers size={20} />}
              items={[
                { label: "Categories", onClick: () => navigate("/categories") },
                { label: "Sub Categories", onClick: () => navigate("/sub-categories") }
              ]}
            />

            <SidebarItem icon={<ImageIcon size={20} />} label="Logos" onClick={() => navigate("/logos")} />
          </>
        )}

      </nav>
    </aside>
  );
};

const SidebarItem: React.FC<{ icon: JSX.Element, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all duration-200 group"
  >
    <span className="text-slate-400 group-hover:text-emerald-400 transition-colors">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const SidebarDropdown: React.FC<{ title: string, icon: JSX.Element, items: { label: string, onClick: () => void }[] }> = ({ title, icon, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="text-slate-400 group-hover:text-emerald-400 transition-colors">{icon}</span>
          <span className="font-medium">{title}</span>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="ml-9 mt-1 space-y-1 border-l border-slate-700 pl-4">
          {items.map((item, idx) => (
            <button 
              key={idx}
              onClick={item.onClick}
              className="w-full text-left py-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;