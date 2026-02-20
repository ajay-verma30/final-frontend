import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronDown, LogOut, User, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();

  const goToProfile = () => { navigate("/profile"); setDropdownOpen(false); };
  const goToCoupons = () => { navigate("/coupons"); setDropdownOpen(false); };
  const goToCart = () => navigate("/cart");
  const goToLogin = () => navigate("/login");

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Left Side - Brand */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
          B
        </div>
        <span className="font-semibold text-lg text-slate-800">BrandName</span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        
          <button
            onClick={goToCart}
            className="relative text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
          </button>

        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-200 px-3 py-1 rounded-md hover:bg-slate-300 transition-colors"
            >
              <span className="text-sm font-medium">Welcome: {user.email}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-slate-200 z-50">
                <ul className="flex flex-col py-1">
                  <li>
                    <button
                      onClick={goToProfile}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={goToCoupons}
                      className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Coupons
                    </button>
                  </li>
                  <hr className="my-1 border-slate-100" />
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={goToLogin}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;