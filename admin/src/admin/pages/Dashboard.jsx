import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard.jsx";
import { apiRequest } from "../../services/api.js";

const shortcuts = [
    {
        title: "Manage Products",
        description: "Review and organize your botanical products.",
        path: "/admin/products",
        icon: "◈",
    },
    {
        title: "Manage Categories",
        description: "Organize products into categories.",
        path: "/admin/categories",
        icon: "▤",
    },
    {
        title: "Research & Articles",
        description: "Manage botanical research and articles.",
        path: "/admin/research",
        icon: "✎",
    },
    {
        title: "Customer Enquiries",
        description: "Review messages from customers.",
        path: "/admin/enquiries",
        icon: "✉",
    },
];

function getCount(response) {
    if (typeof response?.count === "number") {
        return response.count;
    }

    if (Array.isArray(response?.data)) {
        return response.data.length;
    }

    if (Array.isArray(response?.enquiries)) {
        return response.enquiries.length;
    }

    if (Array.isArray(response?.data?.enquiries)) {
        return response.data.enquiries.length;
    }

    return 0;
}

export default function Dashboard() {
    const [stats, setStats] = useState({
        products: null,
        categories: null,
        articles: null,
        enquiries: null,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadDashboardStats() {
            try {
                setLoading(true);
                setError("");

                const [
                    productsResponse,
                    categoriesResponse,
                    articlesResponse,
                    enquiriesResponse,
                ] = await Promise.all([
                    apiRequest("/products/admin/all?all=true"),
                    apiRequest("/categories/admin/all?all=true"),
                    apiRequest("/articles/admin/all"),
                    apiRequest("/enquiries"),
                ]);

                if (!active) return;

                setStats({
                    products: getCount(productsResponse),
                    categories: getCount(categoriesResponse),
                    articles: getCount(articlesResponse),
                    enquiries: getCount(enquiriesResponse),
                });
            } catch (err) {
                if (active) {
                    setError(
                        err.message ||
                            "Unable to load dashboard statistics."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadDashboardStats();

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="dashboard-page">
            <section className="welcome-banner">
                <div>
                    <span className="eyebrow">
                        ADMINISTRATION OVERVIEW
                    </span>

                    <h2>Welcome to SAB</h2>

                    <p>
                        Manage your products, botanical information, and
                        company content from one place.
                    </p>
                </div>

                <div className="welcome-mark">S</div>
            </section>

            <section className="section-heading">
                <div>
                    <h2>Business Overview</h2>
                    <p>Your management summary.</p>
                </div>
            </section>

            {error && (
                <div className="dashboard-note" role="alert">
                    <span className="dashboard-note-icon">!</span>

                    <div>
                        <strong>
                            Statistics could not be loaded
                        </strong>

                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            <section className="stats-grid">
                <StatCard
                    title="Total Products"
                    value={
                        loading
                            ? "..."
                            : stats.products ?? "—"
                    }
                    description={
                        loading
                            ? "Loading products..."
                            : "Products stored in your catalogue"
                    }
                    icon="◈"
                />

                <StatCard
                    title="Categories"
                    value={
                        loading
                            ? "..."
                            : stats.categories ?? "—"
                    }
                    description={
                        loading
                            ? "Loading categories..."
                            : "Categories stored in your catalogue"
                    }
                    icon="▤"
                />

                <StatCard
                    title="Research Articles"
                    value={
                        loading
                            ? "..."
                            : stats.articles ?? "—"
                    }
                    description={
                        loading
                            ? "Loading articles..."
                            : "Published articles and drafts"
                    }
                    icon="✎"
                />

                <StatCard
                    title="Customer Enquiries"
                    value={
                        loading
                            ? "..."
                            : stats.enquiries ?? "—"
                    }
                    description={
                        loading
                            ? "Loading enquiries..."
                            : "Customer messages received"
                    }
                    icon="✉"
                />
            </section>

            <section className="section-heading quick-actions-heading">
                <div>
                    <h2>Quick Access</h2>
                    <p>Go directly to a management section.</p>
                </div>
            </section>

            <section className="quick-actions-grid">
                {shortcuts.map((item) => (
                    <Link
                        to={item.path}
                        className="quick-action-card"
                        key={item.path}
                    >
                        <span className="quick-action-icon">
                            {item.icon}
                        </span>

                        <div className="quick-action-copy">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>

                        <span className="quick-action-arrow">
                            →
                        </span>
                    </Link>
                ))}
            </section>

            <section className="dashboard-note">
                <span className="dashboard-note-icon">i</span>

                <div>
                    <strong>Live catalogue statistics</strong>

                    <p>
                        Product, category, and article totals are
                        retrieved from your backend. Customer enquiry
                        totals are also requested from the enquiries API.
                    </p>
                </div>
            </section>
        </div>
    );
}
