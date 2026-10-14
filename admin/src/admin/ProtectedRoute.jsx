import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
const { isAuthenticated, loading } = useAuth();
const location = useLocation();

```
if (loading) {
    return (
        <div className="sa-admin-loading">
            <div className="sa-admin-spinner" />
            <p>Verifying your administrator session...</p>
        </div>
    );
}

if (!isAuthenticated) {
    return (
        <Navigate
            to="/admin/login"
            replace
            state={{ from: location }}
        />
    );
}

return <Outlet />;
```

}