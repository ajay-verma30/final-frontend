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

// ProtectedRoute component import karein
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

function App() {
  return (
    <Router>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/" element={<Shop/>}/>
        <Route path="/product/:slug" element={<PublicProductDetails/>}/>

        {/* ================= PROTECTED ROUTES ================= */}
        {/* Dashboard */}
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

        {/* Products related */}
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

        {/* Categories & Subcategories */}
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
