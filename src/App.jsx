import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { LangProvider } from "./context/LangContext";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/CheckoutPage"
;import OrderConfirm from "./pages/OrderConfirm";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminBanners from "./pages/admin/Banners";
import AdminSettings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route path="/products/:id" element={<ProductDetail />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
    <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
    <Route path="/order-confirm/:id" element={<PrivateRoute><OrderConfirm /></PrivateRoute>} />
    <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
    <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
    <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
    <Route path="/admin/banners" element={<AdminRoute><AdminBanners /></AdminRoute>} />
    <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppRoutes />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}