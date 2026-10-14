import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet,
} from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./Home.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";

import About from "./pages/About.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Research from "./pages/Research.jsx";
import ResearchArticle from "./pages/ResearchArticle.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";

import "./Site.css";

function PublicLayout() {
    return (
        <div className="sa-site">
            <Header />

            <main>
                <Outlet />
            </main>

            <Footer />
            <WhatsAppButton />
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public website */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/products" element={<Products />} />
                        <Route
                            path="/products/:id"
                            element={<ProductDetails />}
                        />
                        <Route path="/research" element={<Research />}
 />
                       <Route
                        path="/research/:slug"
                        element={<ResearchArticle />}
/>

                        <Route path="/contact" element={<Contact />} />
                    </Route>

                    {/* Admin authentication */}
                    <Route
                        path="/admin"
                        element={<Navigate to="/admin/login" replace />}
                    />

                    <Route
                        path="/admin/login"
                        element={<AdminLogin />}
                    />

                    {/* Protected admin pages */}
                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/admin/dashboard"
                            element={
                                <div style={{ padding: "40px" }}>
                                    <h1>Admin Dashboard</h1>
                                    <p>
                                        Authentication successful. Your
                                        dashboard will be built here.
                                    </p>
                                </div>
                            }
                        />
                    </Route>

                    {/* Unknown routes */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;