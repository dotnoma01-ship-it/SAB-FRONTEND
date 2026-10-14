import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar.jsx";
import AdminHeader from "./components/AdminHeader.jsx";

const pageTitles = {
  "/admin/dashboard": "Overview",
  "/admin/products": "Products",
  "/admin/products/new": "Add Product",
  "/admin/categories": "Categories",
  "/admin/research": "Research & Articles",
  "/admin/enquiries": "Customer Enquiries",
  "/admin/company": "Company Information",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title =
    pageTitles[location.pathname] || "SAB Administration";

  return (
    <div className="admin-shell">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-main">
        <AdminHeader
          title={title}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="admin-content">
          <Outlet />
        </main>

        <footer className="admin-footer">
          <span>© {new Date().getFullYear()} SAB</span>
          <span>SOUGHT AFTER BOTACEUTICAL</span>
        </footer>
      </div>
    </div>
  );
}
