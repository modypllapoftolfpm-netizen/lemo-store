import { createContext, useContext, useState, useEffect } from "react";

const ar = {
  storeName: "ليمو ستور",
  loading: "جاري التحميل...",
  currency: "ج.م",
  viewAll: "عرض الكل",
  nav: { home: "الرئيسية", products: "المنتجات", cart: "السلة", wishlist: "المفضلة", orders: "طلباتي", profile: "حسابي", login: "تسجيل الدخول", signup: "إنشاء حساب", logout: "تسجيل الخروج", admin: "لوحة التحكم" },
  categories: { all: "الكل", gifts: "الهدايا", scented: "الشموع المعطرة", decorative: "الشموع الديكورية", body: "مرطبات الجسم" },
  home: { bestSellers: "الأكثر مبيعاً", newArrivals: "وصل حديثاً", shopNow: "تسوقي الآن", freeShipping: "شحن مجاني على الطلبات فوق", exploreCategories: "تصفحي التصنيفات" },
  products: { addToCart: "أضف للسلة", outOfStock: "نفذت الكمية", new: "جديد", bestSeller: "الأكثر مبيعاً", addToWishlist: "أضف للمفضلة" },
  cart: { title: "سلة التسوق", empty: "سلتك فارغة", subtotal: "المجموع", discount: "الخصم", total: "الإجمالي", checkout: "إتمام الشراء", remove: "إزالة", promoCode: "كود الخصم", applyPromo: "تطبيق" },
  auth: { loginTitle: "تسجيل الدخول", signupTitle: "إنشاء حساب", email: "البريد الإلكتروني", password: "كلمة المرور", name: "الاسم الكامل", phone: "رقم الهاتف", loginBtn: "دخول", signupBtn: "إنشاء الحساب", hasAccount: "لديك حساب؟", noAccount: "ليس لديك حساب؟" },
  orders: { title: "طلباتي", empty: "لا توجد طلبات", status: { pending: "قيد الانتظار", processing: "جاري التجهيز", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغي" } },
  admin: { dashboard: "لوحة التحكم", products: "المنتجات", orders: "الطلبات", settings: "الإعدادات", addProduct: "إضافة منتج", deleteConfirm: "هل أنت متأكد؟" },
};

const en = {
  storeName: "LEMO Store",
  loading: "Loading...",
  currency: "EGP",
  viewAll: "View All",
  nav: { home: "Home", products: "Products", cart: "Cart", wishlist: "Wishlist", orders: "My Orders", profile: "My Account", login: "Login", signup: "Sign Up", logout: "Logout", admin: "Dashboard" },
  categories: { all: "All", gifts: "Gifts", scented: "Scented Candles", decorative: "Decorative Candles", body: "Body Moisturizers" },
  home: { bestSellers: "Best Sellers", newArrivals: "New Arrivals", shopNow: "Shop Now", freeShipping: "Free shipping on orders above", exploreCategories: "Explore Categories" },
  products: { addToCart: "Add to Cart", outOfStock: "Out of Stock", new: "New", bestSeller: "Best Seller", addToWishlist: "Add to Wishlist" },
  cart: { title: "Shopping Cart", empty: "Your cart is empty", subtotal: "Subtotal", discount: "Discount", total: "Total", checkout: "Checkout", remove: "Remove", promoCode: "Promo Code", applyPromo: "Apply" },
  auth: { loginTitle: "Login", signupTitle: "Create Account", email: "Email", password: "Password", name: "Full Name", phone: "Phone", loginBtn: "Login", signupBtn: "Create Account", hasAccount: "Already have an account?", noAccount: "Don't have an account?" },
  orders: { title: "My Orders", empty: "No orders yet", status: { pending: "Pending", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" } },
  admin: { dashboard: "Dashboard", products: "Products", orders: "Orders", settings: "Settings", addProduct: "Add Product", deleteConfirm: "Are you sure?" },
};

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("lemo_lang") || "ar");
  const t = lang === "ar" ? ar : en;
  const isRTL = lang === "ar";

  useEffect(() => {
    localStorage.setItem("lemo_lang", lang);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [lang, isRTL]);

  const toggleLang = () => setLang((prev) => (prev === "ar" ? "en" : "ar"));
  const field = (obj, key) => {
    if (!obj) return "";
    return lang === "ar" ? obj[`${key}Ar`] || obj[`${key}En`] : obj[`${key}En`] || obj[`${key}Ar`];
  };

  return (
    <LangContext.Provider value={{ lang, t, isRTL, toggleLang, field }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);