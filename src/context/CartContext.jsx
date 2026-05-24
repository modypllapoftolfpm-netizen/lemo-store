import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lemo_cart")) || [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem("lemo_cart", JSON.stringify(items));
  }, [items]);

  // ─── Add to cart ─────────────────────────────────────────────────────────
  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
            : i
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  // ─── Remove from cart ────────────────────────────────────────────────────
  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  // ─── Update quantity ─────────────────────────────────────────────────────
  const updateQty = (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);
    setItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, qty } : i))
    );
  };

  // ─── Clear cart ──────────────────────────────────────────────────────────
  const clearCart = () => setItems([]);

  // ─── Derived values ──────────────────────────────────────────────────────
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal  = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const getTotal = (discountPercent = 0) => {
    const discount = (subtotal * discountPercent) / 100;
    return { subtotal, discount, total: subtotal - discount };
  };

  const isInCart = (productId) => items.some((i) => i.id === productId);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQty, clearCart, itemCount, subtotal, getTotal, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};