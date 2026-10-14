import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
const { isAuthenticated, loading } = useAuth();


if (loading) {
    return (
        <div className="sa-loading-screen">
            <div className="sa-loading-spinner" />
            <p>Verifying your session...</p>
        </div>
    );
}

if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
}

return <Outlet />;


}
