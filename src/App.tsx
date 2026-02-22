import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ResetPassword from "./pages/Reset";
import SetPassword from "./pages/SetPassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import NewProduct from "./pages/NewProduct";
import Categories from "./pages/Categories";
import SubCategories from "./pages/SubCategories";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "../src/components/ProtectedRoute";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Organizations from "./pages/Organizations";
import OrganizationDetails from "./pages/OrganizationDetails";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import Logos from "./pages/Logos";
import LogoDetails from "./pages/LogoDetails";
import CustomizeProduct from "./pages/CustomizeProduct";
import Coupons from "./pages/Coupons";
import Shop from "./shop/Shop";
import PublicProductDetails from "./shop/PublicProductDetails";
import Checkout from "./shop/Checkout";
import OrderHistory from "./shop/Orderhistory";
import { CartProvider } from "./context/CartContext";
import Cart from "./shop/Cart";
import SubShop from "./shop/SubShop";
import Contact from "./shop/Contact";

function App() {
  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC / SHOP ROUTES ================= */}
        {/* CartProvider wraps only shop routes — the cart context is not
            needed by the admin side of the app */}
        <Route
          path="/"
          element={
            <CartProvider>
              <Shop />
            </CartProvider>
          }
        />
        <Route
          path="/shop"
          element={
            <CartProvider>
              <SubShop />
            </CartProvider>
          }
        />
        <Route
          path="/product/:slug"
          element={
            <CartProvider>
              <PublicProductDetails />
            </CartProvider>
          }
        />
        <Route
          path="/cart"
          element={
            <CartProvider>
              <Cart />
            </CartProvider>
          }
        />
        <Route
          path="/checkout"
          element={
            <CartProvider>
              <Checkout />
            </CartProvider>
          }
        />
        <Route
          path="/contact"
          element={
            <CartProvider>
              <Contact />
            </CartProvider>
          }
        />
        <Route
          path="/orders"
          element={
            <CartProvider>
              <OrderHistory />
            </CartProvider>
          }
        />

        {/* ================= AUTH ROUTES ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* ================= PROTECTED / ADMIN ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizations"
          element={
            <ProtectedRoute>
              <Organizations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organization/:id"
          element={
            <ProtectedRoute>
              <OrganizationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:id"
          element={
            <ProtectedRoute>
              <GroupDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/all-products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customize/:id"
          element={
            <ProtectedRoute>
              <CustomizeProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-product"
          element={
            <ProtectedRoute>
              <NewProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sub-categories"
          element={
            <ProtectedRoute>
              <SubCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logos"
          element={
            <ProtectedRoute>
              <Logos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logo/:id"
          element={
            <ProtectedRoute>
              <LogoDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coupons"
          element={
            <ProtectedRoute>
              <Coupons />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
