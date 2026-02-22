import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronDown, LogOut, User, Plus, Archive, Search, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const goToProfile = () => { navigate("/profile"); setDropdownOpen(false); };
  const goToCoupons = () => { navigate("/coupons"); setDropdownOpen(false); };
  const goToCart = () => navigate("/cart");
  const goToLogin = () => navigate("/login");
  const goToOrders = () => { navigate("/orders"); setDropdownOpen(false); };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Dispatch a custom event so Shop.tsx (or any listener) can react
    window.dispatchEvent(new CustomEvent("navbar-search", { detail: e.target.value }));
  };

  const clearSearch = () => {
    setSearchQuery("");
    window.dispatchEvent(new CustomEvent("navbar-search", { detail: "" }));
    searchRef.current?.focus();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm px-6 py-3 flex items-center gap-4 justify-between">

      {/* ── Brand ── */}
      <div
        className="flex items-center gap-2 cursor-pointer flex-shrink-0"
        onClick={() => navigate("/")}
      >
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm select-none">
          B
        </div>
        <span className="font-semibold text-lg text-slate-800 tracking-tight">BrandName</span>
      </div>

      {/* ── Search bar ── */}
      <div
        className="flex-grow max-w-xl"
        style={{ position: "relative" }}
      >
        {/* Search icon */}
        <Search
          size={15}
          style={{
            position: "absolute",
            left: "13px",
            top: "50%",
            transform: "translateY(-50%)",
            color: searchFocused ? "#6366f1" : "#94a3b8",
            transition: "color 0.2s",
            pointerEvents: "none",
          }}
        />

        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search products…"
          style={{
            width: "100%",
            padding: "9px 38px 9px 36px",
            borderRadius: "10px",
            border: searchFocused
              ? "1.5px solid rgba(99,102,241,0.6)"
              : "1.5px solid #e2e8f0",
            background: searchFocused ? "#f8f7ff" : "#f8fafc",
            fontSize: "0.875rem",
            color: "#1e293b",
            outline: "none",
            transition: "all 0.2s",
            boxShadow: searchFocused ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />

        {/* Clear button — only visible when there's text */}
        {searchQuery && (
          <button
            onMouseDown={(e) => e.preventDefault()} // prevent blur before click
            onClick={clearSearch}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "#e2e8f0",
              border: "none",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#cbd5e1")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e2e8f0")}
          >
            <X size={10} color="#64748b" />
          </button>
        )}
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-5 flex-shrink-0">

        {/* Cart */}
        <button
          onClick={goToCart}
          className="relative text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none font-bold">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </button>

        {/* Auth */}
        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {/* Avatar circle */}
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-indigo-600">
                  {user.email?.[0]?.toUpperCase() ?? "U"}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                {user.email}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white shadow-xl rounded-xl border border-slate-100 z-50 overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">{user.email}</p>
                </div>

                <ul className="flex flex-col py-1">
                  <li>
                    <button
                      onClick={goToProfile}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" /> Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={goToCoupons}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Coupons
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={goToOrders}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5" /> My Orders
                    </button>
                  </li>
                  <hr className="my-1 border-slate-100" />
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={goToLogin}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;