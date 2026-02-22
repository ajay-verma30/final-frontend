import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import ProductCard from "../shop/components/ProductCard";
import { ChevronRight, X, Sparkles, ArrowRight, Zap } from "lucide-react";
import ShopNavbar from "./components/ShopNavbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  parent_segment: string;   // from c.parent_segment in controller
  gender: string;           // from c.gender in controller
  supports_gender: number;  // from c.supports_gender in controller
  sub_category_id: number;
  sub_category_name: string;
  main_image: string | null;
}

interface ShopCategory {
  id: number;
  name: string;
  slug: string;
  parent_segment: string;
  gender: string;         // MENS | WOMENS | KIDS | UNISEX
  supports_gender: number;
}

interface ShopSubcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  parent_segment: string;
  gender: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

// Segments that have gender variants
const GENDER_SEGMENTS = new Set(["APPAREL", "FOOTWEAR", "HEADWEAR"]);

const GENDER_LABELS: Record<string, string> = {
  MENS:   "Men's",
  WOMENS: "Women's",
  KIDS:   "Kids'",
  UNISEX: "Unisex",
};

const GENDER_EMOJI: Record<string, string> = {
  MENS: "👔", WOMENS: "👗", KIDS: "🧒", UNISEX: "✦",
};

// ─── Hero Section ─────────────────────────────────────────────────────────────

const HeroSection = ({ onShopNow, onGetQuote }: { onShopNow: () => void; onGetQuote: () => void }) => (
  <section style={{
    background: "linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #24243e 100%)",
    position: "relative", overflow: "hidden", minHeight: "520px",
    display: "flex", alignItems: "center",
  }}>
    <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: "-100px", right: "30%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", top: "20%", right: "10%", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "64px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center", position: "relative", zIndex: 10, width: "100%" }}>
      {/* Left */}
      <div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.35)", borderRadius: "999px", padding: "6px 16px", marginBottom: "28px" }}>
          <Sparkles size={13} color="#a5b4fc" />
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "#a5b4fc", textTransform: "uppercase" }}>B2B Branded Merchandise</span>
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 900, lineHeight: 1.08, color: "#fff", margin: "0 0 20px 0", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>
          Your Brand,<br />
          <span style={{ background: "linear-gradient(90deg, #818cf8, #c084fc, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>On Everything.</span>
        </h1>
        <p style={{ fontSize: "1.05rem", color: "rgba(203,213,225,0.85)", lineHeight: 1.65, margin: "0 0 36px 0", maxWidth: "420px", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          Upload your logo. Pick your products. We handle the rest. Custom-branded apparel, bags, and accessories — fulfilled at scale for your organization.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button onClick={onShopNow} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px 28px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 32px rgba(99,102,241,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
            Shop Now <ArrowRight size={16} />
          </button>
          <button onClick={onGetQuote} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.06)", color: "rgba(203,213,225,0.9)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", padding: "14px 24px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <Zap size={15} /> Get a Quote
          </button>
        </div>
      </div>

      {/* Right: product images */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-end", height: "400px" }}>
        <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", width: "320px", height: "40px", background: "radial-gradient(ellipse, rgba(99,102,241,0.4) 0%, transparent 70%)", filter: "blur(16px)" }} />
        <div style={{ position: "absolute", right: "60px", bottom: "20px", animation: "floatSlow 6s ease-in-out infinite" }}>
          <img src="/Images/Tshirt.png" alt="T-shirt" style={{ height: "300px", objectFit: "contain", filter: "drop-shadow(0 24px 48px rgba(99,102,241,0.5))", transform: "rotate(-4deg)" }} />
        </div>
        <div style={{ position: "absolute", left: "20px", bottom: "30px", animation: "floatSlow 6s ease-in-out infinite 2s" }}>
          <img src="/Images/bag.png" alt="Bag" style={{ height: "220px", objectFit: "contain", filter: "drop-shadow(0 16px 32px rgba(168,85,247,0.45))", transform: "rotate(5deg)" }} />
        </div>
      </div>
    </div>

    <style>{`
      @keyframes floatSlow { 0%,100%{transform:rotate(-4deg) translateY(0)} 50%{transform:rotate(-4deg) translateY(-12px)} }
    `}</style>
  </section>
);

// ─── Filter Pill component ────────────────────────────────────────────────────

const FilterPill = ({
  label, active, onClick, disabled = false,
}: { label: string; active: boolean; onClick: () => void; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border
      ${active
        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
        : disabled
          ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
      }
    `}
  >
    {label}
  </button>
);

// ─── Filter Row component ─────────────────────────────────────────────────────

const FilterRow = ({
  label, children, visible,
}: { label: string; children: React.ReactNode; visible: boolean }) => {
  if (!visible) return null;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest w-28 flex-shrink-0">
        {label}
      </span>
      <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
      <div className="flex items-center gap-2 flex-wrap">
        {children}
      </div>
    </div>
  );
};

// ─── Main Shop Component ──────────────────────────────────────────────────────

const Shop = () => {
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();

  // Data
  const [products, setProducts]         = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<ShopCategory[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<ShopSubcategory[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showHero, setShowHero]         = useState(true);

  // Filter state — 4 levels
  const [selectedSegment,    setSelectedSegment]    = useState<string | null>(null);
  const [selectedGender,     setSelectedGender]     = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubId,      setSelectedSubId]      = useState<number | null>(null);
  const [searchQuery,        setSearchQuery]        = useState("");

  const productGridRef = useRef<HTMLDivElement>(null);

  // ── Fetch filter data (categories + subcategories) ──────────────────────
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await api.get("/api/public/shop-filters");
        setAllCategories(res.data.data.categories || []);
        setAllSubcategories(res.data.data.subcategories || []);
      } catch (err) {
        console.error("Error loading filters:", err);
      }
    };
    loadFilters();
  }, []);

  // ── Fetch products ───────────────────────────────────────────────────────
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res  = await api.get("/api/public/public-products");
        const data: Product[] = res.data.data;
        setProducts(data);

        // Handle URL params (breadcrumb navigation)
        const catSlug = searchParams.get("category");
        const subSlug = searchParams.get("subcategory");
        if (catSlug) {
          const matched = data.find(p => (p.category_slug || p.category_name?.toLowerCase().replace(/\s+/g, "-")) === catSlug);
          if (matched) {
            setSelectedCategoryId(matched.category_id);
            setSelectedSegment(matched.parent_segment);
          }
        }
        if (subSlug) {
          const matched = data.find(p => p.sub_category_name?.toLowerCase().replace(/\s+/g, "-") === subSlug);
          if (matched) setSelectedSubId(matched.sub_category_id);
        }
      } catch (err) {
        console.error("Error loading shop data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // ── Listen to navbar search ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      setSearchQuery((e as CustomEvent<string>).detail);
    };
    window.addEventListener("navbar-search", handler);
    return () => window.removeEventListener("navbar-search", handler);
  }, []);

  // ── Hide hero on any filter ──────────────────────────────────────────────
  useEffect(() => {
    if (selectedSegment || selectedCategoryId || searchQuery) setShowHero(false);
  }, [selectedSegment, selectedCategoryId, searchQuery]);

  // ── Derived: genders available for selected segment ──────────────────────
  const gendersForSegment: string[] = React.useMemo(() => {
    if (!selectedSegment) return [];
    if (!GENDER_SEGMENTS.has(selectedSegment)) return []; // no gender filter for BAGS/ACCESSORIES/STATIONERY
    const cats = allCategories.filter(c => c.parent_segment === selectedSegment);
    const genders = Array.from(new Set(cats.map(c => c.gender)));
    return genders;
  }, [selectedSegment, allCategories]);

  // ── Derived: categories for selected segment + gender ────────────────────
  const categoriesForFilter: ShopCategory[] = React.useMemo(() => {
    if (!selectedSegment) return [];
    return allCategories.filter(c => {
      const matchSeg = c.parent_segment === selectedSegment;
      // If segment has genders and user picked one, filter; else show all
      const matchGender = gendersForSegment.length === 0 || !selectedGender || c.gender === selectedGender;
      return matchSeg && matchGender;
    });
  }, [selectedSegment, selectedGender, allCategories, gendersForSegment]);

  // ── Derived: subcategories for selected category ─────────────────────────
  const subcategoriesForFilter: ShopSubcategory[] = React.useMemo(() => {
    if (!selectedCategoryId) return [];
    return allSubcategories.filter(s => s.category_id === selectedCategoryId);
  }, [selectedCategoryId, allSubcategories]);

  // ── Product filtering ────────────────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    const matchSearch   = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSegment  = !selectedSegment || p.parent_segment === selectedSegment;
    // gender comes from c.gender in the products query — fall back to category lookup if somehow missing
    const productGender = p.gender || allCategories.find(c => c.id === p.category_id)?.gender || "UNISEX";
    const matchGender   = !selectedGender || productGender === selectedGender;
    const matchCategory = !selectedCategoryId || p.category_id === selectedCategoryId;
    const matchSub      = !selectedSubId   || p.sub_category_id === selectedSubId;
    return matchSearch && matchSegment && matchGender && matchCategory && matchSub;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSegmentSelect = (seg: string) => {
    if (selectedSegment === seg) {
      // toggle off — clicking active segment deselects it
      clearAll();
      return;
    }
    setSelectedSegment(seg);
    setSelectedGender(null);
    setSelectedCategoryId(null);
    setSelectedSubId(null);
    setShowHero(false);
  };

  const handleGenderSelect = (g: string) => {
    if (selectedGender === g) {
      setSelectedGender(null);
    } else {
      setSelectedGender(g);
    }
    setSelectedCategoryId(null);
    setSelectedSubId(null);
  };

  const handleCategorySelect = (catId: number) => {
    if (selectedCategoryId === catId) {
      setSelectedCategoryId(null);
      setSelectedSubId(null);
    } else {
      setSelectedCategoryId(catId);
      setSelectedSubId(null);
    }
  };

  const handleSubSelect = (subId: number) => {
    setSelectedSubId(prev => prev === subId ? null : subId);
  };

  const clearAll = () => {
    setSelectedSegment(null);
    setSelectedGender(null);
    setSelectedCategoryId(null);
    setSelectedSubId(null);
    setSearchQuery("");
    setShowHero(true);
  };

  const handleShopNow = () => {
    setShowHero(false);
    productGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Active label for heading ─────────────────────────────────────────────
  const selectedCategoryObj = allCategories.find(c => c.id === selectedCategoryId);
  const selectedSubObj      = allSubcategories.find(s => s.id === selectedSubId);
  const activeLabel =
    selectedSubObj?.name ??
    selectedCategoryObj?.name ??
    (selectedGender ? GENDER_LABELS[selectedGender] : null) ??
    (selectedSegment ? SEGMENT_LABELS[selectedSegment as ParentSegment] : null);

  // ── Active filter chips (breadcrumb) ─────────────────────────────────────
  const activeFilters = [
    selectedSegment    && { key: "segment",  label: SEGMENT_LABELS[selectedSegment as ParentSegment] ?? selectedSegment,  clear: clearAll },
    selectedGender     && { key: "gender",   label: GENDER_LABELS[selectedGender] ?? selectedGender, clear: () => { setSelectedGender(null); setSelectedCategoryId(null); setSelectedSubId(null); } },
    selectedCategoryId && { key: "category", label: selectedCategoryObj?.name ?? "",                 clear: () => { setSelectedCategoryId(null); setSelectedSubId(null); } },
    selectedSubId      && { key: "sub",      label: selectedSubObj?.name ?? "",                      clear: () => setSelectedSubId(null) },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  // ── Does selected segment support gender filtering? ──────────────────────
  const segmentHasGender = selectedSegment ? GENDER_SEGMENTS.has(selectedSegment) && gendersForSegment.length > 1 : false;

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopNavbar />

      {/* ── 4-Level Horizontal Filter Bar ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-8 py-1">

          {/* Row 1: Parent Segment */}
          <FilterRow label="Category" visible={true}>
            <FilterPill label="All" active={!selectedSegment} onClick={clearAll} />
            {PARENT_SEGMENTS.map(seg => (
              <FilterPill
                key={seg}
                label={SEGMENT_LABELS[seg]}
                active={selectedSegment === seg}
                onClick={() => handleSegmentSelect(seg)}
              />
            ))}
          </FilterRow>

          {/* Row 2: Gender — only if segment supports it */}
          <FilterRow label="Gender" visible={!!selectedSegment && segmentHasGender}>
            <FilterPill
              label="All"
              active={!selectedGender}
              onClick={() => { setSelectedGender(null); setSelectedCategoryId(null); setSelectedSubId(null); }}
            />
            {gendersForSegment.map(g => (
              <FilterPill
                key={g}
                label={`${GENDER_EMOJI[g] ?? ""} ${GENDER_LABELS[g] ?? g}`}
                active={selectedGender === g}
                onClick={() => handleGenderSelect(g)}
              />
            ))}
          </FilterRow>

          {/* Row 3: Category */}
          <FilterRow label="Type" visible={!!selectedSegment && categoriesForFilter.length > 0}>
            <FilterPill
              label="All"
              active={!selectedCategoryId}
              onClick={() => { setSelectedCategoryId(null); setSelectedSubId(null); }}
            />
            {categoriesForFilter.map(cat => (
              <FilterPill
                key={cat.id}
                label={cat.name}
                active={selectedCategoryId === cat.id}
                onClick={() => handleCategorySelect(cat.id)}
              />
            ))}
          </FilterRow>

          {/* Row 4: Subcategory */}
          <FilterRow label="Style" visible={!!selectedCategoryId && subcategoriesForFilter.length > 0}>
            <FilterPill
              label="All"
              active={!selectedSubId}
              onClick={() => setSelectedSubId(null)}
            />
            {subcategoriesForFilter.map(sub => (
              <FilterPill
                key={sub.id}
                label={sub.name}
                active={selectedSubId === sub.id}
                onClick={() => handleSubSelect(sub.id)}
              />
            ))}
          </FilterRow>

          {/* Active filter breadcrumb + Clear */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 py-2 border-t border-slate-100 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold w-28 flex-shrink-0">Filters</span>
              <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />
              {activeFilters.map((f, i) => (
                <React.Fragment key={f.key}>
                  <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
                    {f.label}
                    <button
                      onClick={f.clear}
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                  {i < activeFilters.length - 1 && (
                    <ChevronRight size={11} className="text-slate-300" />
                  )}
                </React.Fragment>
              ))}
              <button
                onClick={clearAll}
                className="ml-auto text-xs text-slate-400 hover:text-red-400 font-semibold transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Hero ── */}
      {showHero && (
        <HeroSection
          onShopNow={handleShopNow}
          onGetQuote={() => navigate("/contact")}
        />
      )}

      {/* ── Product Grid ── */}
      <div ref={productGridRef} className="max-w-screen-xl mx-auto px-8 py-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900">{activeLabel ?? "Discover"}</h2>
            <p className="text-slate-500 font-medium italic">{filteredProducts.length} items found</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            [1, 2, 3, 4].map(n => (
              <div key={n} className="aspect-[4/5] bg-slate-200 animate-pulse rounded-3xl" />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(p => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">No products found.</p>
              {activeFilters.length > 0 && (
                <button onClick={clearAll} className="mt-4 text-indigo-600 text-sm font-semibold hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;