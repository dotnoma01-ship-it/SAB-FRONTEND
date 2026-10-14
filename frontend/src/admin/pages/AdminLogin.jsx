import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "../Admin.css";

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(form.email.trim(), form.password);

            const destination = location.state?.from?.pathname || "/admin/dashboard";
            navigate(destination, { replace: true });
        } catch (err) {
            setError(err.message || "Unable to sign in. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="sab-login-page">
            <div className="sab-login-decoration sab-login-decoration-one" />
            <div className="sab-login-decoration sab-login-decoration-two" />

            <div className="sab-login-container">
                <Link to="/" className="sab-login-brand">
                    <span className="sab-brand-symbol">S</span>
                    <span>
                        <strong>SOUGHT AFTER</strong>
                        <small>BOTACEUTICAL</small>
                    </span>
                </Link>

                <div className="sab-login-card">
                    <div className="sab-login-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 3 4.5 6v5.2c0 4.5 3.1 7.8 7.5 9.8 4.4-2 7.5-5.3 7.5-9.8V6L12 3Z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinejoin="round"
                            />
                            <path
                                d="m9 12 2 2 4-4"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <p className="sab-login-eyebrow">ADMINISTRATOR ACCESS</p>
                    <h1>Welcome back</h1>
                    <p className="sab-login-description">
                        Sign in to manage your botanical business website.
                    </p>

                    {error && (
                        <div className="sab-login-error" role="alert">
                            <span aria-hidden="true">!</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="sab-login-form">
                        <label htmlFor="admin-email">Email address</label>
                        <input
                            id="admin-email"
                            name="email"
                            type="email"
                            placeholder="Enter your administrator email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                        />

                        <div className="sab-password-label">
                            <label htmlFor="admin-password">Password</label>
                        </div>

                        <div className="sab-password-field">
                            <input
                                id="admin-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="sab-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="sab-login-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="sab-button-spinner" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in to dashboard
                                    <span aria-hidden="true">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="sab-login-security">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <rect x="5" y="10" width="14" height="11" rx="2"
                                stroke="currentColor" strokeWidth="1.6" />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3"
                                stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                        Secure access for authorized administrators only
                    </div>
                </div>

                <p className="sab-login-footer">
                    © {new Date().getFullYear()} SOUGHT AFTER BOTACEUTICAL
                </p>
            </div>
        </div>
    );
}