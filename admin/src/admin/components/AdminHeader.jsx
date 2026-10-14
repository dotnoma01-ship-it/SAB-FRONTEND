import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminHeader({ onMenuClick, title = "Overview" }) {
const { admin, logout } = useAuth();

const displayName =
admin?.name ||
admin?.fullName ||
admin?.email ||
"Administrator";

return (
<header className="admin-header">
<div className="header-left">
<button type="button" className="mobile-menu-button" onClick={onMenuClick} aria-label="Open navigation" >
☰
</button>
    <div>
      <div className="header-breadcrumb">
        SAB <span>/</span> Administration
      </div>
      <h1>{title}</h1>
    </div>
  </div>

  <div className="header-right">
    <div className="admin-identity">
      <div className="admin-avatar">
        {String(displayName).charAt(0).toUpperCase()}
      </div>

      <div className="admin-identity-text">
        <strong>{displayName}</strong>
        <span>Administrator</span>
      </div>
    </div>

    <button
      type="button"
      className="logout-button"
      onClick={logout}
      title="Log out"
    >
      ↗ <span>Logout</span>
    </button>
  </div>
</header>
);
}
