import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        closeMenu();
    }, [location.pathname]);

    useEffect(() => {
        if (!menuOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [menuOpen]);

    const navItems = [
        { label: "Home", to: "/", end: true },
        { label: "About Us", to: "/about" },
        { label: "Our Products", to: "/products" },
        { label: "Research", to: "/research" },
        { label: "Contact", to: "/contact" },
    ];

    return (
        <>
            <div className="sa-announcement">
                BOTANICAL KNOWLEDGE <span aria-hidden="true">·</span>{" "}
                RESPONSIBLE SOURCING <span aria-hidden="true">·</span>{" "}
                SCIENCE-LED INNOVATION
            </div>

            <header className="sa-header">
                <div className="sa-container sa-nav">
                    <Link
                        className="sa-brand"
                        to="/"
                        onClick={closeMenu}
                        aria-label="Sought After Botaceuticals home"
                    >
                        <span className="sa-brand-mark">S</span>

                        <span className="sa-brand-text">
                            <span className="sa-brand-name">
                                SOUGHT AFTER
                            </span>

                            <span className="sa-brand-subtitle">
                                Botaceuticals
                            </span>
                        </span>
                    </Link>

                    <nav
                        id="sa-main-navigation"
                        className={`sa-nav-links ${
                            menuOpen ? "sa-nav-open" : ""
                        }`}
                        aria-label="Main navigation"
                    >
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                    isActive ? "sa-nav-active" : undefined
                                }
                                aria-current={
                                    location.pathname === item.to
                                        ? "page"
                                        : undefined
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}

                        <Link
                            className="sa-mobile-contact"
                            to="/contact"
                            onClick={closeMenu}
                        >
                            Get in Touch <span aria-hidden="true">?</span>
                        </Link>
                    </nav>

                    <Link className="sa-button sa-desktop-contact" to="/contact">
                        Get in Touch <span aria-hidden="true">?</span>
                    </Link>

                    <button
                        className="sa-mobile-toggle"
                        type="button"
                        aria-label={
                            menuOpen ? "Close navigation" : "Open navigation"
                        }
                        aria-controls="sa-main-navigation"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {menuOpen ? (
                            <span aria-hidden="true">×</span>
                        ) : (
                            <span aria-hidden="true">?</span>
                        )}
                    </button>
                </div>
            </header>
        </>
    );
}

export default Header;
