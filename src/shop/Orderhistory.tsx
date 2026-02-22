import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import ShopNavbar from "./components/ShopNavbar";
import api from "../api/axiosInstance";
import Footer from "./components/Footer";

interface OrderItem {
  id: number;
  product_variant_id: number;
  quantity: number;
  unit_price: string;
  total_price: string;
  product_name: string;
  color: string;
  size: string;
  sku: string;
}

interface Order {
  id: number;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  subtotal: string;
  total_price: string;
  currency: string;
  stripe_payment_intent_id: string;
  created_at: string;
  items: OrderItem[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PAID:      { bg: "#f0fdf4", text: "#16a34a", label: "Paid" },
  PENDING:   { bg: "#fefce8", text: "#ca8a04", label: "Pending" },
  FAILED:    { bg: "#fef2f2", text: "#dc2626", label: "Failed" },
  CANCELLED: { bg: "#f8fafc", text: "#64748b", label: "Cancelled" },
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    api.get("/api/user/orders")
      .then((res) => { if (res.data.success) setOrders(res.data.data); })
      .catch((err) => console.error("FETCH ORDERS ERROR:", err))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen" style={{ background: "#f8f6f2", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .jost { font-family: 'Jost', sans-serif; }
        .order-card { transition: box-shadow 0.2s ease; }
        .order-card:hover { box-shadow: 0 4px 24px rgba(42,31,20,0.07); }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>

      <ShopNavbar />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-[#2a1f14] tracking-wide">Order History</h1>
          <p className="jost text-xs text-[#9a8a78] mt-1 uppercase tracking-widest">
            All your past and current orders
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <div className="w-10 h-10 border-2 border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
            <p className="jost text-sm text-[#9a8a78] tracking-widest uppercase">Loading orders...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6">
            <div className="w-20 h-20 rounded-full bg-[#f3ede6] flex items-center justify-center">
              <ShoppingBag size={32} className="text-[#c8a96e]" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-light text-[#2a1f14] mb-2">No orders yet</h2>
              <p className="jost text-sm text-[#9a8a78] tracking-wider">Your completed orders will appear here</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="jost px-8 py-3 rounded-xl text-sm font-semibold tracking-widest uppercase transition-all hover:opacity-90"
              style={{ background: "#2a1f14", color: "white" }}
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const status  = STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING;
              const isOpen  = expandedId === order.id;
              const date    = new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="order-card fade-in bg-white rounded-2xl border border-[#e8dfd4] overflow-hidden"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Order header — always visible */}
                  <button
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                    onClick={() => toggle(order.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#f3ede6] flex items-center justify-center flex-shrink-0">
                        <Package size={18} className="text-[#c8a96e]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-[#2a1f14]" style={{ fontSize: "1.05rem" }}>
                            Order #{order.id}
                          </p>
                          <span
                            className="jost text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: status.bg, color: status.text }}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="jost text-[11px] text-[#9a8a78] mt-0.5 uppercase tracking-wider">{date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className="font-semibold text-[#2a1f14]"
                        style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.3rem" }}
                      >
                        ${parseFloat(order.total_price).toFixed(2)}
                      </span>
                      {isOpen
                        ? <ChevronUp size={16} className="text-[#9a8a78]" />
                        : <ChevronDown size={16} className="text-[#9a8a78]" />
                      }
                    </div>
                  </button>

                  {/* Expanded order items */}
                  {isOpen && (
                    <div className="border-t border-[#f0ebe3] px-6 py-4 space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#f3ede6] flex items-center justify-center flex-shrink-0">
                              <Package size={14} className="text-[#c8bfb4]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#2a1f14]">{item.product_name}</p>
                              <p className="jost text-[10px] text-[#9a8a78] uppercase tracking-wider">
                                {item.color} · Size {item.size} · Qty {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="jost text-right">
                            <p className="text-[10px] text-[#9a8a78]">
                              ${parseFloat(item.unit_price).toFixed(2)} × {item.quantity}
                            </p>
                            <p className="font-semibold text-[#2a1f14] text-sm">
                              ${parseFloat(item.total_price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Order totals */}
                      <div className="border-t border-[#f0ebe3] pt-3 space-y-1.5">
                        <div className="flex justify-between jost text-xs text-[#9a8a78]">
                          <span className="uppercase tracking-wider">Subtotal</span>
                          <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between jost text-xs text-[#9a8a78]">
                          <span className="uppercase tracking-wider">Shipping</span>
                          <span>
                            {parseFloat(order.total_price) - parseFloat(order.subtotal) === 0
                              ? "Free"
                              : `$${(parseFloat(order.total_price) - parseFloat(order.subtotal)).toFixed(2)}`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between jost text-sm font-semibold text-[#2a1f14] pt-1">
                          <span className="uppercase tracking-wider text-xs">Total</span>
                          <span>${parseFloat(order.total_price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
}