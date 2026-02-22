import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag } from "lucide-react";
import { useCart } from "../context/CartContext";
import ShopNavbar from "./components/ShopNavbar";
import api from "../api/axiosInstance";
import Footer from "./components/Footer";

export default function Cart() {
  const navigate = useNavigate();
  const { items, totalItems, fetchCart } = useCart();
  // ── Derived totals ──────────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => {
    const base    = parseFloat(item.base_price)    || 0;
    const variant = parseFloat(item.variant_price) || 0;
    return sum + (base + variant) * item.quantity;
  }, 0);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleQuantityChange = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await api.patch(`/api/cart/item/${itemId}`, { quantity: newQty });
      await fetchCart();
    } catch (err) {
      console.error("UPDATE QTY ERROR:", err);
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await api.delete(`/api/cart/item/${itemId}`);
      await fetchCart();
    } catch (err) {
      console.error("REMOVE ITEM ERROR:", err);
    }
  };

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: "#f8f6f2", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');
          .jost { font-family: 'Jost', sans-serif; }
        `}</style>
        <ShopNavbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <div className="w-20 h-20 rounded-full bg-[#f3ede6] flex items-center justify-center">
            <ShoppingBag size={32} className="text-[#c8a96e]" />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-light text-[#2a1f14] mb-2">Your cart is empty</h2>
            <p className="jost text-sm text-[#9a8a78] tracking-wider">Looks like you haven't added anything yet</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="jost mt-2 px-8 py-3 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all hover:opacity-90"
            style={{ background: "#2a1f14", color: "white" }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8f6f2", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .jost { font-family: 'Jost', sans-serif; }
        .cart-item { transition: box-shadow 0.2s ease; }
        .cart-item:hover { box-shadow: 0 4px 24px rgba(42,31,20,0.08); }
        .qty-btn {
          width: 32px; height: 32px;
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
        .remove-btn { transition: all 0.2s; }
        .remove-btn:hover { color: #e53e3e; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>

      <ShopNavbar />

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light text-[#2a1f14] tracking-wide">Your Cart</h1>
            <p className="jost text-xs text-[#9a8a78] mt-1 uppercase tracking-widest">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="jost flex items-center gap-2 text-sm text-[#9a8a78] hover:text-[#5a4a3a] transition-colors"
          >
            <ArrowLeft size={15} />
            Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

          {/* ── Cart Items ── */}
          <div className="space-y-4">
            {items.map((item, i) => {
              const unitPrice  = (parseFloat(item.base_price) || 0) + (parseFloat(item.variant_price) || 0);
              const totalPrice = unitPrice * item.quantity;
              const isCustom   = !!item.customization_snapshot;
              const imageUrl   = isCustom && item.preview_image_url
                ? item.preview_image_url
                : null;

              return (
                <div
                  key={item.id}
                  className="cart-item fade-in bg-white rounded-2xl border border-[#e8dfd4] p-5 flex gap-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Product image */}
                  <div className="w-24 h-28 flex-shrink-0 rounded-xl overflow-hidden border border-[#ede8df] bg-[#f3ede6]">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={24} className="text-[#c8bfb4]" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {/* Product name — clickable to go back to product page */}
                        <h3
                          className="text-lg font-medium text-[#2a1f14] leading-tight cursor-pointer hover:text-[#c8a96e] transition-colors"
                          onClick={() => navigate(`/product/${item.product_slug}`)}
                        >
                          {item.product_name}
                        </h3>
                        <p className="jost text-[10px] text-[#9a8a78] uppercase tracking-widest mt-0.5">
                          {item.product_slug}
                        </p>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="remove-btn flex-shrink-0 text-[#c8bfb4] p-1"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Variant tags */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="jost text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#f3ede6] text-[#8a7560] border border-[#e8dfd4]">
                        {item.color}
                      </span>
                      <span className="jost text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#f3ede6] text-[#8a7560] border border-[#e8dfd4]">
                        Size {item.size}
                      </span>
                      {isCustom && (
                        <span className="jost text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#fdf6ea] text-[#c8a96e] border border-[#e8c87a]">
                          ✦ Customized
                        </span>
                      )}
                    </div>

                    {/* Quantity + Price row */}
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity control */}
                      <div className="flex items-center gap-2">
                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          className="w-8 text-center font-semibold text-[#2a1f14]"
                          style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.1rem" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="jost text-right">
                        <p className="text-[10px] text-[#9a8a78] uppercase tracking-wider">
                          ${unitPrice.toFixed(2)} × {item.quantity}
                        </p>
                        <p
                          className="font-semibold text-[#2a1f14]"
                          style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.3rem" }}
                        >
                          ${totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Order Summary ── */}
          <div className="bg-white rounded-2xl border border-[#e8dfd4] p-6 sticky top-6 fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-xl font-medium text-[#2a1f14] mb-5 tracking-wide">Order Summary</h2>

            <div className="space-y-3 jost text-sm">
              <div className="flex justify-between text-[#5a4a3a]">
                <span className="text-[#9a8a78] uppercase tracking-wider text-[11px]">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#5a4a3a]">
                <span className="text-[#9a8a78] uppercase tracking-wider text-[11px]">Shipping</span>
                <span className="font-medium text-[#38a169]">
                  {subtotal >= 99 ? "Free" : "$9.99"}
                </span>
              </div>
              {subtotal < 99 && (
                <p className="text-[10px] text-[#c8a96e] tracking-wide">
                  Add ${(99 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
            </div>

            <div className="border-t border-[#e8dfd4] mt-5 pt-4 flex justify-between items-center">
              <span className="jost text-xs uppercase tracking-widest text-[#5a4a3a] font-semibold">Total</span>
              <span
                className="font-semibold text-[#2a1f14]"
                style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.6rem" }}
              >
                ${(subtotal + (subtotal >= 99 ? 0 : 9.99)).toFixed(2)}
              </span>
            </div>

            <button
              className="jost w-full mt-6 py-4 rounded-xl font-semibold text-sm tracking-widest uppercase transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "#2a1f14", color: "white" }}
              onClick={() => navigate("/checkout")}
            >
              <Tag size={15} />
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate("/")}
              className="jost w-full mt-3 py-3 rounded-xl font-medium text-sm tracking-widest uppercase transition-all border border-[#e8dfd4] text-[#9a8a78] hover:border-[#c8a96e] hover:text-[#5a4a3a]"
            >
              Continue Shopping
            </button>
          </div>

        </div>
      </main>
      <Footer/>
    </div>
  );
}