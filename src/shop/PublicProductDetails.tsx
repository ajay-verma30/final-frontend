import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import ShopNavbar from "./components/ShopNavbar";
import { ShoppingBag, Shield, Truck, RotateCcw, ChevronRight, Star, Minus, Plus, Heart, Share2, ZoomIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

interface PriceTier {
  id: number;
  min_qty: number;
  unit_price?: string;
  price?: string;
}

interface ProductImage {
  id: number;
  url: string;
  view_type: string;
}

interface Variant {
  id: number;
  color: string;
  size: string;
  variant_price: string;
  sku: string;
  stock: number;
  images: ProductImage[];
  price_tiers: PriceTier[];
}

interface Customization {
  id: number;
  logo_variant_id: number;
  product_variant_image_id: number;
  logo_url: string;
  logo_title: string;
  custom_name: string;
  pos_x: number;
  pos_y: number;
  logo_width: number;
  logo_height?: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  gender: string;
  base_price: string;
  category: { id: number; slug: string; assets: any[] };
  subcategory: { id: number; category_id: number; slug: string };
  product_images: { id: number; image_url: string; is_primary: number }[];
  variants: Variant[];
  customizations: Customization[];
}

const COLOR_MAP: Record<string, string> = {
  BLACK: "#1a1a1a",
  WHITE: "#f5f5f5",
  RED: "#e53e3e",
  BLUE: "#3182ce",
  GREEN: "#38a169",
  YELLOW: "#d69e2e",
  PINK: "#d53f8c",
  PURPLE: "#805ad5",
  ORANGE: "#dd6b20",
  GRAY: "#718096",
  GREY: "#718096",
  NAVY: "#2c3e7a",
  BROWN: "#8b4513",
  BEIGE: "#f5f0e8",
};

function getColorHex(color: string): string {
  return COLOR_MAP[color?.toUpperCase()] || "#94a3b8";
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export default function PublicProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Set<number>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "sizing" | "shipping">("details");
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  useEffect(() => {
    if (!slug) return;
    api.get(`api/public/details/${slug}`).then((res) => {
      const data: Product = res.data.data;
      setProduct(data);
      if (data.variants?.length > 0) {
        const firstVariant = data.variants[0];
        setSelectedColor(firstVariant.color);
        setSelectedVariant(firstVariant);
        setSelectedImage(firstVariant?.images[0] || null);
      }
    });
  }, [slug]);

  if (!product) return (
    <div className="h-screen flex items-center justify-center bg-[#f8f6f2]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#8a7560] text-sm font-medium tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );

  const filteredCustomizations = product.customizations.filter(
    (c) => c.product_variant_image_id === selectedImage?.id
  );

  // Unique colors derived from variants
  const uniqueColors = Array.from(new Map(product.variants.map((v) => [v.color, v])).values());

  // Sizes available for the selected color
  const sizesForColor = product.variants.filter((v) => v.color === selectedColor);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedCustomizations(new Set());
    // Pick first variant of this color (any size) to show its images
    const firstOfColor = product.variants.find((v) => v.color === color);
    if (firstOfColor) {
      setSelectedVariant(firstOfColor);
      setSelectedImage(firstOfColor.images[0] || null);
    }
  };

  const handleSizeSelect = (variant: Variant) => {
    if (variant.stock === 0) return;
    setSelectedVariant(variant);
    setSelectedImage(variant.images[0] || null);
    setSelectedCustomizations(new Set());
  };

  const basePrice = parseFloat(product.base_price) || 0;
  const variantPrice = parseFloat(selectedVariant?.variant_price || "0") || 0;
  const inStock = (selectedVariant?.stock ?? 0) > 0;

  // Composites the product image + ALL selected logo overlays onto one canvas.
  // Accepts an array so all logos are drawn in a single pass.
  const buildCompositeBlob = (
    productImgUrl: string,
    customizations: Customization[]
  ): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const W = 900, H = 1200;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));

      const base = new Image();
      base.crossOrigin = "anonymous";
      base.onerror = () => reject(new Error("Failed to load product image"));
      base.onload = () => {
        const scale = Math.max(W / base.width, H / base.height);
        const dw = base.width * scale, dh = base.height * scale;
        ctx.drawImage(base, (W - dw) / 2, (H - dh) / 2, dw, dh);

        const drawLogos = (index: number) => {
          if (index >= customizations.length) {
            canvas.toBlob(
              (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
              "image/png"
            );
            return;
          }
          const c = customizations[index];
          const logo = new Image();
          logo.crossOrigin = "anonymous";
          logo.onerror = () => reject(new Error("Failed to load logo: " + c.logo_url));
          logo.onload = () => {
            const lw = (parseFloat(String(c.logo_width)) / 100) * W;
            const lh = c.logo_height
              ? (parseFloat(String(c.logo_height)) / 100) * H
              : lw * (logo.naturalHeight / logo.naturalWidth);
const lx = (parseFloat(String(c.pos_x)) / 100) * W;
const ly = (parseFloat(String(c.pos_y)) / 100) * H;
            ctx.drawImage(logo, lx, ly, lw, lh);
            drawLogos(index + 1);
          };
          logo.src = c.logo_url;
        };

        drawLogos(0);
      };
      base.src = productImgUrl;
    });

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedVariant || !selectedImage) return;

    setIsCartLoading(true);
    try {
      const activeCustomizations = filteredCustomizations.filter((c) =>
        selectedCustomizations.has(c.id)
      );

      if (activeCustomizations.length > 0) {
        // CUSTOMIZED PATH: composite all logos → save design → add to cart
        const blob = await buildCompositeBlob(selectedImage.url, activeCustomizations);
        const logoVariantIds = activeCustomizations.map((c) => c.logo_variant_id);

        const customFormData = new FormData();
        customFormData.append("custom_image", blob, "design.png");
        customFormData.append("product_id", String(product.id));
        customFormData.append("product_variant_id", String(selectedVariant.id));
        customFormData.append("product_variant_image_id", String(selectedImage.id));
        customFormData.append("logo_variant_ids", JSON.stringify(logoVariantIds));

        const saveRes = await api.post("/api/user/custom/save", customFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (!saveRes.data.success) {
          throw new Error("Failed to save custom design");
        }

        // addToCart from CartContext — calls API + refreshes context state
        await addToCart({
          product_variant_id: selectedVariant.id,
          quantity,
          custom_product_id: saveRes.data.id,
          custom_url: saveRes.data.custom_url,
          logo_variant_ids: logoVariantIds,
          product_variant_image_id: selectedImage.id,
        });

      } else {
        // PLAIN PRODUCT PATH: straight to cart, no custom tables touched
        await addToCart({
          product_variant_id: selectedVariant.id,
          quantity,
        });
      }

      setIsCartLoading(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Cart error:", error);
      setIsCartLoading(false);
    }
  };
  // Get active price tier (applies to variant_price portion only)
  const activeTier = selectedVariant?.price_tiers
    .slice()
    .sort((a, b) => b.min_qty - a.min_qty)
    .find((t) => quantity >= t.min_qty);

  const effectiveVariantPrice = activeTier
    ? parseFloat(activeTier.unit_price || activeTier.price || "0")
    : variantPrice;

  // Total = base_price + (variant_price * quantity)
  const totalPrice = (basePrice + effectiveVariantPrice) * quantity;

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", background: "#f8f6f2" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        .jost { font-family: 'Jost', sans-serif; }

        .thumb-btn { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
        .thumb-btn:hover { transform: translateY(-2px); }

        .color-swatch { transition: all 0.25s ease; }
        .color-swatch:hover { transform: scale(1.1); }

        .add-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .add-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.15);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }
        .add-btn:hover::after { transform: translateX(0); }
        .add-btn:active { transform: scale(0.98); }

        .tab-btn { transition: all 0.2s ease; }

        .fade-in { animation: fadeIn 0.5s ease forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

        .main-image-wrap { cursor: zoom-in; }
        .main-image-wrap.zoomed { cursor: zoom-out; }

        .qty-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          border: 1.5px solid #d4c4a8;
          background: white;
          color: #5a4a3a;
          cursor: pointer;
          transition: all 0.2s;
        }
        .qty-btn:hover { background: #5a4a3a; color: white; border-color: #5a4a3a; }
        .qty-btn:disabled { opacity: 0.3; cursor: default; }
        .qty-btn:disabled:hover { background: white; color: #5a4a3a; border-color: #d4c4a8; }

        .trust-badge { transition: transform 0.2s; }
        .trust-badge:hover { transform: translateY(-2px); }

        .select-custom {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a4a3a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }
      `}</style>

      <ShopNavbar />

      {/* Breadcrumb */}
      <div className="jost max-w-7xl mx-auto px-6 pt-8 pb-2 flex items-center gap-2 text-xs text-[#9a8a78]" style={{ letterSpacing: '0.08em' }}>
        <span className="hover:text-[#5a4a3a] cursor-pointer transition-colors" onClick={() => navigate('/')}>
  Home
</span>
<span className="hover:text-[#5a4a3a] cursor-pointer transition-colors" onClick={() => navigate(`/shop?category=${product.category.slug}`)}>
  {product.category.slug.replace(/-/g, ' ')}
</span>
<span className="hover:text-[#5a4a3a] cursor-pointer transition-colors" onClick={() => navigate(`/shop?category=${product.category.slug}&subcategory=${product.subcategory.slug}`)}>
  {product.subcategory.slug.replace(/-/g, ' ')}
</span>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr] gap-12 xl:gap-16 items-start">

          {/* ─── LEFT: IMAGE GALLERY ─── */}
          <div className="space-y-4 fade-in max-w-[460px] w-full">

            {/* Thumbnails (vertical strip on desktop) */}
            <div className="flex lg:flex-row gap-4">
              {/* Vertical strip */}
              {selectedVariant && selectedVariant.images.length > 1 && (
                <div className="hidden lg:flex flex-col gap-3 pt-1">
                  {selectedVariant.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => { setSelectedImage(img); setSelectedCustomizations(new Set()); }}
                      className={`thumb-btn w-16 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                        selectedImage?.id === img.id
                          ? "border-[#c8a96e] shadow-md"
                          : "border-[#e8e0d4] opacity-60 hover:opacity-90"
                      }`}
                    >
                      <img src={img.url} alt={img.view_type} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1">
                <div
                  className={`main-image-wrap relative rounded-2xl overflow-hidden bg-white shadow-lg border border-[#ede8df] aspect-[3/4] ${imageZoomed ? 'zoomed' : ''}`}
                  onClick={() => setImageZoomed(!imageZoomed)}
                >
                  {selectedImage ? (
                    <img
                      src={selectedImage.url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700"
                      style={{ transform: imageZoomed ? 'scale(1.5)' : 'scale(1)' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c8bfb4]">
                      <span className="jost text-sm">No image</span>
                    </div>
                  )}

                  {/* Logo overlays — all selected logos rendered */}
                  {filteredCustomizations
                    .filter((c) => selectedCustomizations.has(c.id))
                    .map((c) => (
                      <div
                        key={c.id}
                        className="absolute pointer-events-none"
                        style={{
                          top: `${c.pos_y}%`,
                          left: `${c.pos_x}%`,
                          width: `${c.logo_width}%`,
                          height: c.logo_height ? `${c.logo_height}%` : "auto"
                        }}
                      >
                        <img src={c.logo_url} alt={c.logo_title} className="w-full h-full object-contain" />
                      </div>
                    ))}

                  {/* View type badge */}
                  {selectedImage?.view_type && (
                    <div className="absolute bottom-4 left-4 jost text-[10px] font-500 uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-[#5a4a3a] border border-white/60">
                      {selectedImage.view_type}
                    </div>
                  )}

                  {/* Zoom icon */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-white/60">
                    <ZoomIn size={14} className="text-[#5a4a3a]" />
                  </div>
                </div>

                {/* Horizontal thumbnails on mobile */}
                {selectedVariant && selectedVariant.images.length > 1 && (
                  <div className="flex lg:hidden gap-3 mt-4 justify-center">
                    {selectedVariant.images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => { setSelectedImage(img); setSelectedCustomizations(new Set()); }}
                        className={`thumb-btn w-14 h-18 rounded-lg overflow-hidden border-2 ${
                          selectedImage?.id === img.id
                            ? "border-[#c8a96e] shadow-md"
                            : "border-[#e8e0d4] opacity-60"
                        }`}
                        style={{ height: '4.5rem' }}
                      >
                        <img src={img.url} alt={img.view_type} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info Tabs — below image */}
            <div className="bg-white rounded-2xl border border-[#e8dfd4] overflow-hidden">
              <div className="jost flex border-b border-[#e8dfd4]">
                {(["details", "sizing", "shipping"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tab-btn flex-1 py-3 text-[10px] uppercase tracking-widest font-medium border-b-2 transition-all ${
                      activeTab === tab
                        ? 'border-[#c8a96e] text-[#5a4a3a] bg-[#fdf9f5]'
                        : 'border-transparent text-[#9a8a78] hover:text-[#5a4a3a]'
                    }`}
                    style={{ marginBottom: '-1px' }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="jost p-5 text-sm text-[#6a5a4a] leading-relaxed">
                {activeTab === "details" && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div><span className="text-[#9a8a78] text-[10px] uppercase tracking-wider block">Gender</span><p className="font-medium text-[#5a4a3a] mt-0.5 capitalize">{product.gender.toLowerCase()}</p></div>
                    <div><span className="text-[#9a8a78] text-[10px] uppercase tracking-wider block">Category</span><p className="font-medium text-[#5a4a3a] mt-0.5 capitalize">{product.category.slug.replace(/-/g, ' ')}</p></div>
                    <div><span className="text-[#9a8a78] text-[10px] uppercase tracking-wider block">Style</span><p className="font-medium text-[#5a4a3a] mt-0.5 capitalize">{product.subcategory.slug.replace(/-/g, ' ')}</p></div>
                    <div><span className="text-[#9a8a78] text-[10px] uppercase tracking-wider block">SKU</span><p className="font-medium text-[#5a4a3a] mt-0.5">{selectedVariant?.sku || '—'}</p></div>
                  </div>
                )}
                {activeTab === "sizing" && (
                  <p className="text-[#8a7560] text-sm">Our garments follow standard sizing. We recommend ordering your usual size. For a relaxed fit, size up. Visit our size guide for detailed measurements.</p>
                )}
                {activeTab === "shipping" && (
                  <div className="space-y-1.5 text-[#8a7560] text-sm">
                    <p>Standard shipping: 5–7 business days</p>
                    <p>Express shipping: 2–3 business days</p>
                    <p>Free standard shipping on orders over $99.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: PRODUCT INFO ─── */}
          <div className="space-y-8 fade-in" style={{ animationDelay: '0.1s' }}>

            {/* Header */}
            <div>
              <div className="jost flex items-center gap-3 mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#c8a96e] bg-[#fdf6ea] px-3 py-1 rounded-full border border-[#f0e0c0]">
                  {product.category.slug.replace(/-/g, ' ')} / {product.subcategory.slug.replace(/-/g, ' ')}
                </span>
                <span className={`text-[10px] font-medium uppercase tracking-widest px-3 py-1 rounded-full border ${
                  inStock
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                    : 'text-red-600 bg-red-50 border-red-100'
                }`}>
                  {inStock ? `In Stock · ${selectedVariant?.stock} left` : 'Out of Stock'}
                </span>
              </div>

              <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 600, fontSize: '2.8rem', lineHeight: 1.1, color: '#2a1f14', letterSpacing: '-0.01em' }}>
                {product.name}
              </h1>

              <div className="jost flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className={i < 4 ? "text-[#c8a96e] fill-[#c8a96e]" : "text-[#d4c4a8]"} />
                  ))}
                  <span className="text-[#8a7560] text-xs ml-1.5">4.0 (24 reviews)</span>
                </div>
                <span className="text-[#d4c4a8]">·</span>
                <span className="text-[#8a7560] text-xs">SKU: {selectedVariant?.sku || '—'}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-4">
              <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                <div className="flex items-baseline gap-3">
                  <span style={{ fontSize: '1.1rem', fontWeight: 400, color: '#9a8a78' }}>
                    Base ${basePrice.toFixed(2)}
                  </span>
                  <span style={{ color: '#d4c4a8' }}>+</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 400, color: '#9a8a78' }}>
                    Variant ${effectiveVariantPrice.toFixed(2)}/unit
                  </span>
                </div>
                <span style={{ fontSize: '3rem', fontWeight: 600, color: '#2a1f14', lineHeight: 1.1 }}>
                  ${totalPrice.toFixed(2)}
                </span>
                {activeTier && (
                  <div className="jost text-xs text-emerald-700 font-medium mt-1">
                    Bulk rate applied ({activeTier.min_qty}+ units)
                  </div>
                )}
              </div>
            </div>

            {/* Price Tiers */}
            {selectedVariant?.price_tiers && selectedVariant.price_tiers.length > 0 && (
              <div className="rounded-xl border border-[#e8dfd4] overflow-hidden">
                <div className="jost px-4 py-2.5 bg-[#f3ede6] text-[10px] uppercase tracking-widest text-[#8a7560] font-medium border-b border-[#e8dfd4]">
                  Volume Pricing
                </div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${selectedVariant.price_tiers.length}, 1fr)` }}>
                  {selectedVariant.price_tiers
                    .sort((a, b) => a.min_qty - b.min_qty)
                    .map((tier, i) => {
                      const isActive = quantity >= tier.min_qty;
                      return (
                        <div
                          key={tier.id}
                          className={`jost text-center py-3 px-2 ${i < selectedVariant.price_tiers.length - 1 ? 'border-r border-[#e8dfd4]' : ''} transition-colors ${isActive ? 'bg-[#fdf6ea]' : 'bg-white'}`}
                        >
                          <p className="text-[10px] text-[#9a8a78] font-medium">{tier.min_qty}+ units</p>
                          <p className={`font-semibold text-sm mt-0.5 ${isActive ? 'text-[#c8a96e]' : 'text-[#5a4a3a]'}`}>
                            ${parseFloat(tier.unit_price || tier.price || '0').toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="jost text-[#6a5a4a] leading-relaxed text-sm">{product.description}</p>
            )}

            {/* Divider */}
            <div className="border-t border-[#e8dfd4]" />

            {/* Gender */}
            <div className="jost flex items-center gap-3 text-sm">
              <span className="text-[#9a8a78] text-xs uppercase tracking-widest font-medium">For</span>
              <span className="px-4 py-1.5 rounded-full bg-white border border-[#d4c4a8] text-[#5a4a3a] font-medium text-xs capitalize">
                {product.gender.charAt(0) + product.gender.slice(1).toLowerCase()}
              </span>
            </div>

            {/* Color + Size — same row */}
            {uniqueColors.length > 0 && (
              <div className="flex gap-4 items-start">

                {/* Color dropdown — compact */}
                <div className="flex-shrink-0 w-40">
                  <p className="jost text-[10px] font-medium uppercase tracking-[0.15em] text-[#5a4a3a] mb-2">Color</p>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-[#d4c4a8] z-10 pointer-events-none"
                      style={{ backgroundColor: getColorHex(selectedColor) }}
                    />
                    <select
                      value={selectedColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="jost select-custom w-full border border-[#d4c4a8] rounded-lg pl-8 pr-7 py-2.5 text-sm text-[#5a4a3a] bg-white outline-none focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20 transition-all"
                    >
                      {uniqueColors.map((v) => (
                        <option key={v.color} value={v.color}>
                          {v.color.charAt(0) + v.color.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sizes — fill remaining space */}
                {sizesForColor.length > 0 && (
                  <div className="flex-1 min-w-0">
                    <div className="jost flex items-center justify-between mb-2">
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#5a4a3a]">Size</p>
                      <button className="text-[10px] text-[#c8a96e] underline underline-offset-2">Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sizesForColor.map((v) => {
                        const outOfStock = v.stock === 0;
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => handleSizeSelect(v)}
                            disabled={outOfStock}
                            title={outOfStock ? "Out of stock" : `${v.size} — ${v.stock} left`}
                            className={`jost relative w-11 h-11 rounded-lg border font-medium text-sm transition-all
                              ${isSelected
                                ? 'border-[#5a4a3a] bg-[#5a4a3a] text-white shadow-md'
                                : outOfStock
                                ? 'border-[#e8dfd4] text-[#c8bfb4] bg-[#f8f6f4] cursor-not-allowed'
                                : 'border-[#d4c4a8] text-[#5a4a3a] bg-white hover:border-[#5a4a3a] cursor-pointer'
                              }`}
                          >
                            {outOfStock && (
                              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="absolute w-[130%] h-px bg-[#c8bfb4] rotate-[-30deg]" />
                              </span>
                            )}
                            {v.size}
                          </button>
                        );
                      })}
                    </div>
                    {selectedVariant && (
                      <p className="jost text-[10px] text-[#9a8a78] mt-1.5">
                        {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : "Out of stock"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Logo Placements — multi-select */}
            {filteredCustomizations.length > 0 && (
              <div className="rounded-xl border border-[#e8dfd4] overflow-hidden">
                <div className="jost px-4 py-3 bg-[#f3ede6] flex items-center justify-between border-b border-[#e8dfd4]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#c8a96e]" />
                    <span className="text-[10px] uppercase tracking-widest text-[#8a7560] font-medium">Logo Placements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCustomizations.size > 0 && (
                      <button
                        onClick={() => setSelectedCustomizations(new Set())}
                        className="text-[10px] text-[#9a8a78] hover:text-red-400 transition-colors underline underline-offset-2"
                      >
                        Clear
                      </button>
                    )}
                    <span className="text-[10px] text-[#b0a090]">
                      {selectedCustomizations.size > 0
                        ? `${selectedCustomizations.size} selected`
                        : `${filteredCustomizations.length} available`}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div
                    className="divide-y divide-[#f0ebe3] overflow-y-auto"
                    style={{ maxHeight: '204px', scrollbarWidth: 'thin', scrollbarColor: '#d4c4a8 transparent' }}
                  >
                    {filteredCustomizations.map((c) => {
                      const isActive = selectedCustomizations.has(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedCustomizations((prev) => {
                              const next = new Set(prev);
                              isActive ? next.delete(c.id) : next.add(c.id);
                              return next;
                            });
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                            isActive ? 'bg-[#fdf6ea]' : 'bg-white hover:bg-[#faf7f3]'
                          }`}
                        >
                          {/* Checkbox */}
                          <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            isActive ? 'border-[#c8a96e] bg-[#c8a96e]' : 'border-[#d4c4a8] bg-white'
                          }`}>
                            {isActive && (
                              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>

                          {/* Logo thumbnail */}
                          <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center border overflow-hidden transition-all ${
                            isActive ? 'border-[#c8a96e]' : 'border-[#e8dfd4]'
                          }`} style={{ background: '#f3ede6' }}>
                            <img src={c.logo_url} alt={c.logo_title} className="w-6 h-6 object-contain" />
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className={`jost text-xs font-semibold uppercase tracking-wide truncate ${isActive ? 'text-[#c8a96e]' : 'text-[#5a4a3a]'}`}>
                              {c.logo_title}
                            </p>
                            <p className="jost text-[11px] text-[#9a8a78] truncate">{c.custom_name}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {filteredCustomizations.length > 3 && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none rounded-b-xl"
                      style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))' }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="jost flex items-center gap-3">
                  <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#5a4a3a]">Qty</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-semibold text-[#2a1f14]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem' }}>
                      {quantity}
                    </span>
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.min(selectedVariant?.stock ?? 99, quantity + 1))}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 jost text-right">
                  <p className="text-[10px] text-[#9a8a78] uppercase tracking-wider">Order Total</p>
                  <span className="font-semibold text-[#2a1f14]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.4rem' }}>
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || isCartLoading}
                  className="add-btn jost flex-1 py-4 px-4 rounded-xl font-semibold text-sm tracking-widest uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: addedToCart ? '#38a169' : '#2a1f14',
                    color: 'white',
                  }}
                >
                  {isCartLoading ? (
                    <>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                      />
                      <span>Adding...</span>
                    </>
                  ) : addedToCart ? (
                    <>
                      <ShoppingBag size={16} />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>Add to Cart</span>
                      <span className="ml-auto pl-4 border-l border-white/30 font-black">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setWishlist(!wishlist)}
                  className="jost w-14 rounded-xl border border-[#d4c4a8] bg-white flex items-center justify-center transition-all hover:border-red-300 hover:bg-red-50"
                >
                  <Heart size={18} className={wishlist ? "fill-red-400 text-red-400" : "text-[#9a8a78]"} />
                </button>

                <button className="jost w-14 rounded-xl border border-[#d4c4a8] bg-white flex items-center justify-center transition-all hover:border-[#c8a96e] hover:bg-[#fdf6ea]">
                  <Share2 size={16} className="text-[#9a8a78]" />
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Orders over $99" },
                { icon: RotateCcw, label: "Easy Returns", sub: "30-day window" },
                { icon: Shield, label: "Secure Pay", sub: "SSL encrypted" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="trust-badge jost text-center p-3 rounded-xl border border-[#e8dfd4] bg-white">
                  <Icon size={16} className="mx-auto text-[#c8a96e] mb-2" />
                  <p className="text-[10px] font-semibold text-[#5a4a3a] uppercase tracking-wider">{label}</p>
                  <p className="text-[9px] text-[#9a8a78] mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}