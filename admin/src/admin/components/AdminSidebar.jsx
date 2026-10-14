
import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Overview", path: "/admin/dashboard", icon: "▦" },
  { label: "Products", path: "/admin/products", icon: "◈" },
  { label: "Categories", path: "/admin/categories", icon: "▤" },
  { label: "Research & Articles", path: "/admin/research", icon: "✎" },
  { label: "Customer Enquiries", path: "/admin/enquiries", icon: "✉" },
  { label: "Company Information", path: "/admin/company", icon: "⌂" },
];

export default function AdminSidebar({ open = false, onClose }) {
  return (
    <>
      {open && (
        <button
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside className={`admin-sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>SAB</strong>
            <span>ADMINISTRATION</span>
          </div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin/dashboard"}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status-dot" />
          <div>
            <strong>System Online</strong>
            <span>SAB Management Portal</span>
          </div>
        </div>
      </aside>
    </>
  );
}
