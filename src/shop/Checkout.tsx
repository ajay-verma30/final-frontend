import { useEffect, useState, useRef} from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Package, Truck } from "lucide-react";
import ShopNavbar from "./components/ShopNavbar";
import StripeWrapper from "../components/StripeWrapper";
import { useCart } from "../context/CartContext";
import api from "../api/axiosInstance";


interface CheckoutData {
  clientSecret: string;
  order_id: number;
  total: number;
  subtotal: number;
  shipping: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const initCalledRef = useRef(false);
  const { items, clearCart } = useCart();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
    if (initCalledRef.current) return;   
  initCalledRef.current = true;
    initCheckout();
  }, []);

  const initCheckout = async () => {
    try {
      const res = await api.post("/api/user/checkout/create-intent");
      if (res.data.success) {
        setCheckoutData(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to initialise checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    clearCart();
    navigate("/orders");
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8f6f2", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .jost { font-family: 'Jost', sans-serif; }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>

      <ShopNavbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="jost flex items-center gap-2 text-sm text-[#9a8a78] hover:text-[#5a4a3a] transition-colors"
          >
            <ArrowLeft size={15} /> Back to Cart
          </button>
          <div className="h-4 w-px bg-[#d4c4a8]" />
          <h1 className="text-3xl font-light text-[#2a1f14] tracking-wide">Checkout</h1>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <div className="w-10 h-10 border-2 border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
            <p className="jost text-sm text-[#9a8a78] tracking-widest uppercase">Preparing your order...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="jost text-red-600 text-sm font-medium">{error}</p>
            <button
              onClick={() => { setError(null); setLoading(true); initCheckout(); }}
              className="jost mt-4 px-6 py-2 rounded-xl text-sm font-semibold tracking-widest uppercase bg-[#2a1f14] text-white hover:opacity-90 transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main content */}
        {checkoutData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start fade-in">

            {/* Left — Payment form */}
            <div className="bg-white rounded-2xl border border-[#e8dfd4] p-6">
              <h2 className="text-xl font-medium text-[#2a1f14] mb-1 tracking-wide">Payment Details</h2>
              <p className="jost text-xs text-[#9a8a78] uppercase tracking-widest mb-6">
                Secured by Stripe
              </p>
              <StripeWrapper
                clientSecret={checkoutData.clientSecret}
                amount={checkoutData.total.toFixed(2)}
                onSuccess={handleSuccess}
              />
            </div>

            {/* Right — Order summary */}
            <div className="space-y-4 sticky top-6">
              {/* Items */}
              <div className="bg-white rounded-2xl border border-[#e8dfd4] p-5">
                <h3 className="jost text-xs uppercase tracking-widest text-[#8a7560] font-medium mb-4">
                  Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
                </h3>
                <div className="space-y-3">
                  {items.map((item) => {
                    const unit  = (parseFloat(item.base_price) || 0) + (parseFloat(item.variant_price) || 0);
                    const total = unit * item.quantity;
                    return (
                      <div key={item.id} className="flex gap-3 items-start">
                        {/* Thumbnail */}
                        <div className="w-12 h-14 rounded-lg overflow-hidden border border-[#ede8df] bg-[#f3ede6] flex-shrink-0">
                          {item.preview_image_url ? (
                            <img src={item.preview_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-[#c8bfb4]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2a1f14] truncate leading-tight">{item.product_name}</p>
                          <p className="jost text-[10px] text-[#9a8a78] uppercase tracking-wider mt-0.5">
                            {item.color} · Size {item.size} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="jost text-sm font-semibold text-[#2a1f14] flex-shrink-0">
                          ${total.toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-white rounded-2xl border border-[#e8dfd4] p-5 space-y-3">
                <div className="flex justify-between jost text-sm">
                  <span className="text-[#9a8a78] uppercase tracking-wider text-[11px]">Subtotal</span>
                  <span className="text-[#5a4a3a] font-medium">${checkoutData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between jost text-sm">
                  <span className="text-[#9a8a78] uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Truck size={11} /> Shipping
                  </span>
                  <span className={checkoutData.shipping === 0 ? "text-[#38a169] font-medium jost text-sm" : "text-[#5a4a3a] font-medium jost text-sm"}>
                    {checkoutData.shipping === 0 ? "Free" : `$${checkoutData.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-[#e8dfd4] pt-3 flex justify-between items-center">
                  <span className="jost text-xs uppercase tracking-widest text-[#5a4a3a] font-semibold">Total</span>
                  <span className="font-semibold text-[#2a1f14]" style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.5rem" }}>
                    ${checkoutData.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Trust */}
              <div className="flex items-center justify-center gap-2 jost text-[10px] text-[#9a8a78] uppercase tracking-widest">
                <ShieldCheck size={12} className="text-[#c8a96e]" />
                256-bit SSL encrypted payment
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}