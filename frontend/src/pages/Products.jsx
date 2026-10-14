import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api.js";

function Products() {
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");


useEffect(() => {
    let active = true;

    async function loadCategories() {
        try {
            setLoading(true);
            setError("");

            const response = await apiRequest("/categories");

            if (active) {
                setCategories(
                    Array.isArray(response?.data)
                        ? response.data
                        : []
                );
            }
        } catch (err) {
            if (active) {
                setError(
                    err.message ||
                    "Unable to load product categories."
                );
            }
        } finally {
            if (active) {
                setLoading(false);
            }
        }
    }

    loadCategories();

    return () => {
        active = false;
    };
}, []);

return (
    <div className="sa-products-page">
        <section className="sa-products-hero">
            <div className="sa-products-hero-image">
                <img
                    src="/images/botanical-hero.jpg"
                    alt="Green botanical foliage"
                />
            </div>

            <div className="sa-products-hero-overlay"></div>

            <div className="sa-container sa-products-hero-content">
                <span className="sa-eyebrow">
                    THE BOTANICAL COLLECTION
                </span>

                <h1>
                    Nature's potential.
                    <br />
                    <span>Purposefully explored.</span>
                </h1>

                <p>
                    Discover our botanical products, plant-based
                    ingredients, and areas of research.
                </p>

                <a
                    href="#product-categories"
                    className="sa-products-hero-button"
                >
                    Explore Our Categories <span>↘</span>
                </a>

                <div className="sa-products-hero-note">
                    <span className="sa-products-dot"></span>
                    BOTANICALS · KNOWLEDGE · INNOVATION
                </div>
            </div>
        </section>

        <section className="sa-products-intro">
            <div className="sa-container sa-products-intro-grid">
                <div>
                    <span className="sa-eyebrow">
                        WHAT WE EXPLORE
                    </span>

                    <h2>
                        Rooted in nature.
                        <br />
                        <span>Guided by purpose.</span>
                    </h2>
                </div>

                <p>
                    Explore our collection of botanical products and
                    plant-derived materials. Select a category to
                    discover the products available and learn more
                    about our work.
                </p>
            </div>
        </section>

        <section
            className="sa-products-catalogue"
            id="product-categories"
        >
            <div className="sa-container">
                <div className="sa-products-heading">
                    <div>
                        <span className="sa-eyebrow">
                            EXPLORE OUR COLLECTION
                        </span>

                        <h2>Our product categories</h2>
                    </div>

                    <p>
                        Browse our categories and contact our team
                        for further information.
                    </p>
                </div>

                {loading && (
                    <div className="sa-products-message" role="status">
                        Loading product categories...
                    </div>
                )}

                {!loading && error && (
                    <div className="sa-products-message" role="alert">
                        <p>{error}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && categories.length === 0 && (
                    <div className="sa-products-message">
                        <h3>No categories available yet</h3>
                        <p>
                            Please check back soon as we update
                            our collection.
                        </p>
                    </div>
                )}

                {!loading && !error && categories.length > 0 && (
                    <div className="sa-products-grid">
                        {categories.map((category, index) => {
                            const imageUrl =
                                typeof category.image === "string"
                                    ? category.image
                                    : category.image?.url || "";

                            return (
                                <article
                                    className="sa-product-card"
                                    key={category._id || category.slug}
                                >
                                    <Link
                                        to={`/products/${category._id}`}
                                        className="sa-product-image-link"
                                        aria-label={`Explore ${category.name}`}
                                    >
                                        <div className="sa-product-image">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={category.name}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="sa-category-image-placeholder">
                                                    SAB
                                                </div>
                                            )}

                                            <span className="sa-product-number">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>

                                            <span className="sa-product-arrow">
                                                ↗
                                            </span>
                                        </div>
                                    </Link>

                                    <div className="sa-product-card-content">
                                        <span className="sa-product-label">
                                            BOTANICAL COLLECTION
                                        </span>

                                        <h3>{category.name}</h3>

                                        <p>
                                            {category.description ||
                                                `Explore products in our ${category.name} collection.`}
                                        </p>

                                        <Link
                                            to={`/products/${category._id}`}
                                            className="sa-product-link"
                                        >
                                            Explore category <span>→</span>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                <div className="sa-products-enquiry">
                    <div className="sa-products-enquiry-mark">S</div>

                    <div className="sa-products-enquiry-copy">
                        <span className="sa-eyebrow">
                            HAVE A QUESTION?
                        </span>

                        <h2>Let's discuss your requirements.</h2>

                        <p>
                            Contact our team to enquire about our
                            products, product information, or potential
                            collaborations.
                        </p>
                    </div>

                    <Link
                        to="/contact"
                        className="sa-products-enquiry-button"
                    >
                        Contact Our Team <span>↗</span>
                    </Link>
                </div>
            </div>
        </section>
    </div>
);


}

export default Products;
