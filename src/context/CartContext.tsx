import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: number;                        // cart_items.id
  quantity: number;
  preview_image_url: string | null;  // composited design URL (null for plain products)
  customization_snapshot: {
    custom_product_id: number;
    logo_variant_ids: number[];
    product_variant_image_id: number;
  } | null;
  variant_id: number;
  color: string;
  size: string;
  sku: string;
  variant_price: string;
  product_id: number;
  product_name: string;
  base_price: string;
  product_slug: string;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;         // sum of all quantities — used for the navbar badge
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => void;
}

interface AddToCartPayload {
  product_variant_id: number;
  quantity: number;
  // optional — only present for customized products
  custom_product_id?: number;
  custom_url?: string;
  logo_variant_ids?: number[];
  product_variant_image_id?: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Total badge count — sum of quantities, not number of distinct items
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // ── Fetch cart from DB ─────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/api/cart");
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error("FETCH CART ERROR:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ── Add item — calls the API then re-fetches so context stays in sync ──────
  const addToCart = useCallback(async (payload: AddToCartPayload) => {
    await api.post("/api/cart/add", payload);
    await fetchCart();
  }, [fetchCart]);

  // ── Remove item ────────────────────────────────────────────────────────────
  const removeItem = useCallback(async (itemId: number) => {
    await api.delete(`/api/cart/item/${itemId}`);
    // Optimistic update — remove from local state immediately
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // ── Clear local state (e.g. on logout) ────────────────────────────────────
  const clearCart = useCallback(() => setItems([]), []);

  // Fetch cart whenever auth state changes (login / page refresh)
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ items, totalItems, loading, fetchCart, addToCart, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}