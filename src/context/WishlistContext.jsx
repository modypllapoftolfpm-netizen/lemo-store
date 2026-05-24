import { createContext, useContext, useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  // ─── Sync wishlist from Firestore when user logs in ─────────────────────
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    const unsub = onSnapshot(doc(db, "wishlists", user.uid), (snap) => {
      setItems(snap.exists() ? snap.data().items || [] : []);
    });
    return unsub;
  }, [user]);

  // ─── Save wishlist to Firestore ──────────────────────────────────────────
  const saveWishlist = async (newItems) => {
    if (!user) return;
    await setDoc(doc(db, "wishlists", user.uid), { items: newItems });
  };

  // ─── Toggle product in wishlist ──────────────────────────────────────────
  const toggleWishlist = async (product) => {
    const exists = items.some((i) => i.id === product.id);
    const newItems = exists
      ? items.filter((i) => i.id !== product.id)
      : [...items, { id: product.id, nameAr: product.nameAr, nameEn: product.nameEn, price: product.price, imageUrl: product.imageUrl }];
    setItems(newItems);
    await saveWishlist(newItems);
  };

  const isInWishlist = (productId) => items.some((i) => i.id === productId);

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
};