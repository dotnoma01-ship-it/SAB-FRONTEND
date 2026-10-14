import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api.js";

function ProductDetails() {
const { id } = useParams();

const [category, setCategory] = useState(null);
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
    let active = true;

    async function loadCategory() {
        setLoading(true);
        setError("");
        setCategory(null);
        setProducts([]);

        try {
            const [categoryResponse, productsResponse] =
                await Promise.all([
                    apiRequest(`/categories/${id}`),
                    apiRequest(`/products?category=${encodeURIComponent(id)}`),
                ]);

            if (!active) return;

            setCategory(categoryResponse?.data || null);

            setProducts(
                Array.isArray(productsResponse?.data)
                    ? productsResponse.data
                    : []
            );

            if (!categoryResponse?.data) {
                setError("This category could not be found.");
            }
        } catch (err) {
            if (active) {
                setError(
                    err.message ||
                    "Unable to load this category. Please try again."
                );
            }
        } finally {
            if (active) setLoading(false);
        }
    }

    if (id) {
        loadCategory();
    } else {
        setError("No category was selected.");
        setLoading(false);
    }

    return () => {
        active = false;
    };
}, [id]);

if (loading) {
    return (
        <section className="sa-category-not-found">
            <div className="sa-container">
                <span className="sa-eyebrow">SAB COLLECTION</span>
                <h1>Loading category...</h1>
                <p>Please wait while we retrieve the category information.</p>
            </div>
        </section>
    );
}

if (error || !category) {
    return (
        <section className="sa-category-not-found">
            <div className="sa-container">
                <span className="sa-eyebrow">CATEGORY UNAVAILABLE</span>
                <h1>Let's find what you're looking for.</h1>
                <p>{error || "This category is not currently available."}</p>
                <Link to="/products" className="sa-category-back-button">
                    ← Return to Our Categories
                </Link>
            </div>
        </section>
    );
}

const imageUrl =
    typeof category.image === "string"
        ? category.image
        : category.image?.url || "";

return (
    <div className="sa-category-detail">
        <section className="sa-category-breadcrumb">
            <div className="sa-container">
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/products">Our Categories</Link>
                <span>/</span>
                <span>{category.name}</span>
            </div>
        </section>

        <section className="sa-category-hero">
            <div className="sa-container sa-category-hero-grid">
                <div className="sa-category-hero-copy">
                    <span className="sa-eyebrow">
                        SAB BOTANICAL COLLECTION
                    </span>

                    <h1>{category.name}</h1>

                    <h2>
                        {category.description ||
                            "Discover our botanical collection."}
                    </h2>

                    <p>
                        Explore the products available in this category.
                        For further details, specifications, or availability,
                        contact our team.
                    </p>

                    <div className="sa-category-hero-actions">
                        <Link
                            to={`/contact?category=${encodeURIComponent(category.name)}`}
                            className="sa-category-primary-button"
                        >
                            Make an Enquiry <span>↗</span>
                        </Link>

                        <Link
                            to="/products"
                            className="sa-category-secondary-link"
                        >
                            Explore All Categories
                        </Link>
                    </div>
                </div>

                <div className="sa-category-hero-visual">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={category.name}
                        />
                    ) : (
                        <div className="sa-category-image-placeholder">
                            SAB
                        </div>
                    )}

                    <div className="sa-category-image-caption">
                        <span>SOUGHT AFTER BOTACEUTICAL</span>
                        <strong>Nature, thoughtfully explored.</strong>
                    </div>
                </div>
            </div>
        </section>

        <section className="sa-category-focus">
            <div className="sa-container">
                <div className="sa-category-focus-heading">
                    <span className="sa-eyebrow">AVAILABLE COLLECTION</span>
                    <h2>Products in this category</h2>
                    <p>
                        Browse the products currently published in this
                        category.
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="sa-products-message">
                        <h3>No published products yet</h3>
                        <p>
                            This category exists, but there are currently
                            no published products assigned to it. Please
                            check back soon or contact our team.
                        </p>
                        <Link
                            to={`/contact?category=${encodeURIComponent(category.name)}`}
                            className="sa-category-primary-button"
                        >
                            Enquire About This Category <span>↗</span>
                        </Link>
                    </div>
                ) : (
                    <div className="sa-products-grid">
                        {products.map((product) => {
                            const productImage = Array.isArray(product.images)
                                ? product.images[0]?.url || ""
                                : "";

                            return (
                                <article
                                    className="sa-product-card"
                                    key={product._id}
                                >
                                    <div className="sa-product-image">
                                        {productImage ? (
                                            <img
                                                src={productImage}
                                                alt={product.name}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="sa-category-image-placeholder">
                                                SAB
                                            </div>
                                        )}
                                    </div>

                                    <div className="sa-product-card-content">
                                        <span className="sa-product-label">
                                            {category.name}
                                        </span>

                                        <h3>{product.name}</h3>

                                        <p>
                                            {product.shortDescription ||
                                                product.description ||
                                                "Contact us for more information about this product."}
                                        </p>

                                        <Link
                                            to={`/contact?product=${encodeURIComponent(product.name)}&category=${encodeURIComponent(category.name)}`}
                                            className="sa-product-link"
                                        >
                                            Enquire About Product <span>→</span>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>

        <section className="sa-category-information">
            <div className="sa-container sa-category-information-grid">
                <div className="sa-category-information-mark">S</div>

                <div>
                    <span className="sa-eyebrow">NEED MORE INFORMATION?</span>
                    <h2>Let's discuss your requirements.</h2>
                    <p>
                        Contact our team for product information,
                        specifications, or availability.
                    </p>

                    <Link
                        to={`/contact?category=${encodeURIComponent(category.name)}`}
                        className="sa-category-information-link"
                    >
                        Contact Our Team <span>↗</span>
                    </Link>
                </div>
            </div>
        </section>

        <section className="sa-category-bottom-nav">
            <div className="sa-container">
                <Link to="/products">← Back to All Categories</Link>
                <Link to="/contact">Get in Touch ↗</Link>
            </div>
        </section>
    </div>
);

}

export default ProductDetails;
