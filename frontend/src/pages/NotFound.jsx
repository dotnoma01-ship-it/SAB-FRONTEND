import { Link } from "react-router-dom";

function NotFound() {
    return (
        <section className="sa-section">
            <div className="sa-container" style={{ textAlign: "center" }}>
                <span className="sa-eyebrow">404 · PAGE NOT FOUND</span>
                <h1 style={{ color: "var(--green-dark, #103724)", fontSize: "4rem" }}>
                    Lost among the leaves?
                </h1>
                <p style={{ color: "#626a61", lineHeight: 1.8 }}>
                    The page you are looking for may have moved or does not exist.
                </p>
                <Link className="sa-button" to="/">
                    Return Home ↗
                </Link>
            </div>
        </section>
    );
}

export default NotFound;
