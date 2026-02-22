import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import ProductCard from "../shop/components/ProductCard";
import { ChevronDown, X, Sparkles, ArrowRight, Zap } from "lucide-react";
import ShopNavbar from "./components/ShopNavbar";

interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  parent_segment: string;
  sub_category_id: number;
  sub_category_name: string;
  main_image: string | null;
}

// Static enum values from DB schema — no API call needed
const PARENT_SEGMENTS = ["APPAREL", "ACCESSORIES", "FOOTWEAR", "STATIONERY", "HEADWEAR", "BAGS"] as const;
type ParentSegment = typeof PARENT_SEGMENTS[number];

const SEGMENT_LABELS: Record<ParentSegment, string> = {
  APPAREL:     "Apparel",
  ACCESSORIES: "Accessories",
  FOOTWEAR:    "Footwear",
  STATIONERY:  "Stationery",
  HEADWEAR:    "Headwear",
  BAGS:        "Bags",
};

/* ─── Hero Section ─────────────────────────────────────────── */
const HeroSection = ({ onShopNow, onGetQuote }: { onShopNow: () => void; onGetQuote: () => void }) => {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #24243e 100%)",
        position: "relative",
        overflow: "hidden",
        minHeight: "520px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Ambient glowing orbs */}
      <div style={{
        position: "absolute", top: "-80px", left: "-80px",
        width: "400px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-100px", right: "30%",
        width: "350px", height: "350px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "20%", right: "10%",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Subtle grid overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      <div style={{
        maxWidth: "1280px", margin: "0 auto",
        padding: "64px 32px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "48px",
        alignItems: "center",
        position: "relative", zIndex: 10,
        width: "100%",
      }}>
        {/* ── Left: Copy ── */}
        <div>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: "999px",
            padding: "6px 16px",
            marginBottom: "28px",
          }}>
            <Sparkles size={13} color="#a5b4fc" />
            <span style={{
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em",
              color: "#a5b4fc", textTransform: "uppercase",
            }}>
              B2B Branded Merchandise
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
            fontWeight: 900,
            lineHeight: 1.08,
            color: "#fff",
            margin: "0 0 20px 0",
            fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            letterSpacing: "-0.02em",
          }}>
            Your Brand,<br />
            <span style={{
              background: "linear-gradient(90deg, #818cf8, #c084fc, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              On Everything.
            </span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: "1.05rem", color: "rgba(203,213,225,0.85)",
            lineHeight: 1.65, margin: "0 0 36px 0",
            maxWidth: "420px",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
            Upload your logo. Pick your products. We handle the rest.
            Custom-branded apparel, bags, and accessories — fulfilled at scale for your organization.
          </p>

          {/* Stats row */}
          <div style={{
            display: "flex", gap: "32px", marginBottom: "40px",
          }}>
            {[
              { value: "500+", label: "Products" },
              { value: "48hr", label: "Turnaround" },
              { value: "100%", label: "Custom" },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontSize: "1.5rem", fontWeight: 900, color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: "0.7rem", fontWeight: 600,
                  color: "rgba(148,163,184,0.7)",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(203,213,225,0.9)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                padding: "14px 24px",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onClick={onGetQuote}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
              }}
            >
              <Zap size={15} /> Get a Quote
            </button>
          </div>
        </div>

        {/* ── Right: Product showcase ── */}
        <div style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          height: "400px",
        }}>
          {/* Glowing platform disk */}
          <div style={{
            position: "absolute", bottom: "10px", left: "50%",
            transform: "translateX(-50%)",
            width: "320px", height: "40px",
            background: "radial-gradient(ellipse, rgba(99,102,241,0.4) 0%, transparent 70%)",
            filter: "blur(16px)",
          }} />

          {/* T-shirt — large, center-right */}
          <div style={{
            position: "absolute",
            right: "60px",
            bottom: "20px",
            animation: "floatSlow 6s ease-in-out infinite",
          }}>
            <img
              src="/Images/Tshirt.png"
              alt="Custom branded T-shirt"
              style={{
                height: "300px",
                objectFit: "contain",
                filter: "drop-shadow(0 24px 48px rgba(99,102,241,0.5)) drop-shadow(0 0 40px rgba(139,92,246,0.3))",
                transform: "rotate(-4deg)",
              }}
            />
            {/* Logo placement badge */}
            <div style={{
              position: "absolute",
              top: "70px", left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(99,102,241,0.85)",
              backdropFilter: "blur(8px)",
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "9px",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              border: "1px solid rgba(165,180,252,0.4)",
              pointerEvents: "none",
            }}>
              ✦ Logo Placement
            </div>
          </div>

          {/* Bag — smaller, left, slightly behind */}
          <div style={{
            position: "absolute",
            left: "20px",
            bottom: "30px",
            animation: "floatSlow 6s ease-in-out infinite 2s",
          }}>
            <img
              src="/Images/bag.png"
              alt="Custom branded bag"
              style={{
                height: "220px",
                objectFit: "contain",
                filter: "drop-shadow(0 16px 32px rgba(168,85,247,0.45)) drop-shadow(0 0 30px rgba(34,211,238,0.2))",
                transform: "rotate(5deg)",
              }}
            />
          </div>

          {/* Floating feature chips */}
          <div style={{
            position: "absolute",
            top: "20px", right: "0px",
            background: "rgba(15,15,50,0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "12px",
            padding: "10px 14px",
            animation: "floatChip 4s ease-in-out infinite 1s",
          }}>
            <div style={{ fontSize: "9px", color: "rgba(148,163,184,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Fulfillment</div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#fff" }}>Bulk Ready</div>
          </div>

          <div style={{
            position: "absolute",
            top: "100px", left: "0px",
            background: "rgba(15,15,50,0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(168,85,247,0.3)",
            borderRadius: "12px",
            padding: "10px 14px",
            animation: "floatChip 4s ease-in-out infinite 0.5s",
          }}>
            <div style={{ fontSize: "9px", color: "rgba(148,163,184,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Branding</div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#c084fc" }}>Print & Embroidery</div>
          </div>
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: rotate(-4deg) translateY(0px); }
          50% { transform: rotate(-4deg) translateY(-12px); }
        }
        @keyframes floatChip {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        /* Override for bag */
        div[style*="rotate(5deg)"] img {
          animation: none;
        }
      `}</style>
    </section>
  );
};

/* ─── Main Shop Component ──────────────────────────────────── */
const Shop = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHero, setShowHero] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<ParentSegment | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<ParentSegment | null>(null);

  const navRef = useRef<HTMLDivElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/public/public-products");
        const data: Product[] = res.data.data;
        setProducts(data);

        const catSlug = searchParams.get("category");
        const subSlug = searchParams.get("subcategory");

        if (catSlug) {
          const matched = data.find(
            (p) => (p.category_slug || p.category_name?.toLowerCase().replace(/\s+/g, "-")) === catSlug
          );
          if (matched) {
            setSelectedCategoryId(matched.category_id);
            if (matched.parent_segment) setSelectedSegment(matched.parent_segment as ParentSegment);
          }
        }
        if (subSlug) {
          const matched = data.find(
            (p) => p.sub_category_name?.toLowerCase().replace(/\s+/g, "-") === subSlug
          );
          if (matched) setSelectedSubCategoryId(matched.sub_category_id);
        }
      } catch (err) {
        console.error("Error loading shop data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Hide hero when user filters by segment/category
  useEffect(() => {
    if (selectedSegment || selectedCategoryId || searchQuery) {
      setShowHero(false);
    }
  }, [selectedSegment, selectedCategoryId, searchQuery]);

  const handleShopNow = () => {
    setShowHero(false);
    productGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Derived unique categories and subcategories from product list
  const categories = Array.from(
    new Map(
      products.map((p) => [
        p.category_id,
        { id: p.category_id, name: p.category_name, segment: p.parent_segment },
      ])
    ).values()
  );

  const subcategories = Array.from(
    new Map(
      products.map((p) => [
        p.sub_category_id,
        { id: p.sub_category_id, name: p.sub_category_name, category_id: p.category_id },
      ])
    ).values()
  );

  const categoriesForSegment = (seg: ParentSegment) =>
    categories.filter((c) => c.segment === seg);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment = !selectedSegment || p.parent_segment === selectedSegment;
    const matchesCategory = !selectedCategoryId || p.category_id === selectedCategoryId;
    const matchesSub = !selectedSubCategoryId || p.sub_category_id === selectedSubCategoryId;
    return matchesSearch && matchesSegment && matchesCategory && matchesSub;
  });

  const handleSegmentClick = (seg: ParentSegment) => {
    setOpenDropdown((prev) => (prev === seg ? null : seg));
  };

  const handleCategorySelect = (seg: ParentSegment, catId: number | null) => {
    setSelectedSegment(seg);
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId(null);
    setOpenDropdown(null);
  };

  const clearAll = () => {
    setSelectedSegment(null);
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setOpenDropdown(null);
    setShowHero(true);
  };

  const activeLabel = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)?.name
    : selectedSegment
    ? SEGMENT_LABELS[selectedSegment]
    : null;

  const sidebarSubs = selectedCategoryId
    ? subcategories.filter((s) => s.category_id === selectedCategoryId)
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopNavbar
        cartCount={0}
        onSearch={(q) => { setSearchQuery(q); }}
        onLoginClick={() => (window.location.href = "/login")}
      />

      {/* ── Segment nav bar ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="flex items-center" ref={navRef}>

            {/* All */}
            <button
              onClick={clearAll}
              className={`px-5 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${
                !selectedSegment
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              All
            </button>

            {/* Segment tabs */}
            {PARENT_SEGMENTS.map((seg) => {
              const cats = categoriesForSegment(seg);
              const isActive = selectedSegment === seg;
              const isOpen = openDropdown === seg;

              return (
                <div key={seg} className="relative">
                  <button
                    onClick={() => handleSegmentClick(seg)}
                    className={`flex items-center gap-1.5 px-5 py-4 text-sm font-bold tracking-wide transition-all border-b-2 whitespace-nowrap ${
                      isActive
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    {SEGMENT_LABELS[seg]}
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {isOpen && (
                    <div className="absolute top-full left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl min-w-[200px] py-2 mt-px">
                      <button
                        onClick={() => handleCategorySelect(seg, null)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                          isActive && !selectedCategoryId
                            ? "text-indigo-600 bg-indigo-50"
                            : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        }`}
                      >
                        All {SEGMENT_LABELS[seg]}
                      </button>

                      {cats.length > 0 && (
                        <>
                          <div className="mx-4 my-1 border-t border-slate-100" />
                          {cats.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => handleCategorySelect(seg, cat.id)}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                selectedCategoryId === cat.id
                                  ? "text-indigo-600 bg-indigo-50 font-semibold"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                              }`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </>
                      )}

                      {cats.length === 0 && !loading && (
                        <p className="px-4 py-2.5 text-xs text-slate-400 italic">No categories yet</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Active filter indicator */}
            {activeLabel && (
              <div className="ml-auto flex items-center gap-2 pl-4">
                <span className="text-xs text-slate-400">
                  Showing:{" "}
                  <span className="font-semibold text-slate-700">{activeLabel}</span>
                </span>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors"
                >
                  <X size={12} /> Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero Landing Section ── */}
      {showHero && <HeroSection onShopNow={handleShopNow} onGetQuote={() => navigate("/contact")} />}

      {/* ── Page body ── */}
      <div ref={productGridRef} className="max-w-screen-xl mx-auto px-8 py-10 flex gap-10">

        {/* Subcategory sidebar */}
        {sidebarSubs.length > 0 && (
          <aside className="w-52 flex-shrink-0">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              {categories.find((c) => c.id === selectedCategoryId)?.name}
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedSubCategoryId(null)}
                className={`w-full text-left py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                  !selectedSubCategoryId
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                }`}
              >
                All
              </button>
              {sidebarSubs.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() =>
                    setSelectedSubCategoryId((prev) => (prev === sub.id ? null : sub.id))
                  }
                  className={`w-full text-left py-2 px-3 rounded-lg text-sm font-bold transition-all ${
                    selectedSubCategoryId === sub.id
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Product grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-4xl font-black text-slate-900">{activeLabel ?? "Discover"}</h2>
              <p className="text-slate-500 font-medium italic">{filteredProducts.length} items found</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-[4/5] bg-slate-200 animate-pulse rounded-3xl" />
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No products found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;