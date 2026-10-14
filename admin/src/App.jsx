import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import ProductsManagement from "./admin/pages/ProductsManagement.jsx";
import AddProduct from "./admin/pages/AddProduct.jsx";
import CategoriesManagement from "./admin/pages/CategoriesManagement.jsx";
import ResearchManagement from "./admin/pages/ResearchManagement.jsx";
import EnquiriesManagement from "./admin/pages/EnquiriesManagement.jsx";
import CompanyManagement from "./admin/pages/CompanyManagement.jsx";
import "./admin/Admin.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductsManagement />} />
              <Route path="products/new" element={<AddProduct />} />
              <Route path="categories" element={<CategoriesManagement />} />
              <Route path="research" element={<ResearchManagement />} />
              <Route path="enquiries" element={<EnquiriesManagement />} />
              <Route path="company" element={<CompanyManagement />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
