import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "./services/api.js";

const heroImage = "/images/botanical-hero.jpg";
const aboutImage = "/images/botanical-about.jpg";
const extractImage = "/images/botanical-extracts.jpg";
const ingredientImage = "/images/botanical-ingredients.jpg";
const researchImage = "/images/botanical-research.jpg";

const categoryImages = [
extractImage,
ingredientImage,
heroImage,
];

function Home() {
const [categories, setCategories] = useState([]);
const [categoriesLoading, setCategoriesLoading] = useState(true);
const [categoriesError, setCategoriesError] = useState("");


const [featuredProducts, setFeaturedProducts] = useState([]);
const [featuredLoading, setFeaturedLoading] = useState(true);
const [featuredError, setFeaturedError] = useState("");

useEffect(() => {
    let active = true;

    async function loadCategories() {
        try {
            setCategoriesLoading(true);
            setCategoriesError("");

            const response = await apiRequest("/categories");

            if (!active) return;

            setCategories(
                Array.isArray(response?.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            if (active) {
                setCategoriesError(
                    error.message ||
                    "Unable to load product categories."
                );
            }
        } finally {
            if (active) {
                setCategoriesLoading(false);
            }
        }
    }

    async function loadFeaturedProducts() {
        try {
            setFeaturedLoading(true);
            setFeaturedError("");

            const response = await apiRequest(
                "/products?featured=true"
            );

            if (!active) return;

            setFeaturedProducts(
                Array.isArray(response?.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            if (active) {
                setFeaturedError(
                    error.message ||
                    "Unable to load featured products."
                );
            }
        } finally {
            if (active) {
                setFeaturedLoading(false);
            }
        }
    }

    loadCategories();
    loadFeaturedProducts();

    return () => {
        active = false;
    };
}, []);

return (
    <div className="sa-home">

        {/* SPLIT HERO SECTION */}
        <section className="sa-hero-split">
            <div className="sa-hero-content">
                <span className="sa-eyebrow">
                    BOTANICALS · SCIENCE · INNOVATION
                </span>

                <h1>
                    Nature's wisdom.
                    <br />
                    <span>Science's purpose.</span>
                </h1>

                <p>
                    Exploring the possibilities of botanical resources
                    through responsible sourcing, botanical knowledge
                    and a commitment to thoughtful innovation.
                </p>

                <div className="sa-hero-actions">
                    <Link to="/products" className="sa-button">
                        Explore Our Products <span>↗</span>
                    </Link>

                    <Link to="/about" className="sa-hero-secondary">
                        Discover Our Story <span>→</span>
                    </Link>
                </div>

                <div className="sa-hero-note">
                    <span className="sa-hero-note-dot"></span>
                    Rooted in nature. Driven by purpose.
                </div>
            </div>

            <div className="sa-hero-visual">
                <div className="sa-hero-image-frame">
                    <img
                        src={heroImage}
                        alt="Botanical inspiration for Sought After Botaceutical"
                        className="sa-hero-image"
                    />

                    <div className="sa-hero-image-tint"></div>

                    <div className="sa-hero-image-caption">
                        <span>OUR PHILOSOPHY</span>
                        <p>Nature holds possibilities worth exploring.</p>
                    </div>
                </div>

                <div className="sa-hero-decoration"></div>
                <div className="sa-hero-floating-mark">S</div>
            </div>
        </section>

        {/* BRAND VALUES */}
        <section className="sa-values-strip">
            <div className="sa-container sa-values-inner">
                <div>
                    <span className="sa-value-icon">✳</span>
                    <span>Botanical Knowledge</span>
                </div>

                <div>
                    <span className="sa-value-icon">♧</span>
                    <span>Responsible Sourcing</span>
                </div>

                <div>
                    <span className="sa-value-icon">◈</span>
                    <span>Science-Led Innovation</span>
                </div>

                <div>
                    <span className="sa-value-icon">◎</span>
                    <span>Quality & Integrity</span>
                </div>
            </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="sa-section sa-home-about">
            <div className="sa-container sa-home-about-grid">
                <div className="sa-home-about-visual">
                    <img
                        src={aboutImage}
                        alt="Natural botanical materials and plant-inspired innovation"
                        className="sa-home-about-image"
                    />

                    <div className="sa-home-about-badge">
                        <span>OUR APPROACH</span>
                        <strong>Nature, explored thoughtfully.</strong>
                    </div>
                </div>

                <div className="sa-home-about-copy">
                    <span className="sa-eyebrow">WHO WE ARE</span>

                    <h2>
                        A thoughtful approach to
                        <span> botanical innovation.</span>
                    </h2>

                    <p>
                        At Sought After Botaceutical, we are interested
                        in the possibilities of botanical resources and
                        their role in research, product development and
                        responsible innovation.
                    </p>

                    <p>
                        Our approach brings curiosity, botanical
                        knowledge and a commitment to responsible
                        practices together.
                    </p>

                    <Link to="/about" className="sa-inline-link">
                        Learn more about us <span>↗</span>
                    </Link>
                </div>
            </div>
        </section>

        {/* DYNAMIC PRODUCT CATEGORIES */}
        <section className="sa-section sa-home-products">
            <div className="sa-container">
                <div className="sa-home-section-heading">
                    <div>
                        <span className="sa-eyebrow">EXPLORE OUR WORLD</span>
                        <h2>Discover the potential of botanicals.</h2>
                    </div>

                    <Link to="/products" className="sa-inline-link">
                        Explore all products <span>↗</span>
                    </Link>
                </div>

                {categoriesLoading && (
                    <p role="status">
                        Loading product categories...
                    </p>
                )}

                {!categoriesLoading && categoriesError && (
                    <div role="alert">
                        <p>{categoriesError}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!categoriesLoading &&
                    !categoriesError &&
                    categories.length === 0 && (
                        <p>
                            No product categories are available yet.
                            Please check back soon.
                        </p>
                    )}

                {!categoriesLoading &&
                    !categoriesError &&
                    categories.length > 0 && (
                        <div className="sa-home-category-grid">
                            {categories.map((category, index) => {
                                const image =
                                    typeof category.image === "string"
                                        ? category.image
                                        : category.image?.url;

                                const categoryImage =
                                    image ||
                                    categoryImages[
                                        index % categoryImages.length
                                    ];

                                const categoryId =
                                    category._id || category.id;

                                return (
                                    <Link
                                        to={`/products/${categoryId}`}
                                        className="sa-home-category"
                                        key={categoryId || category.slug}
                                    >
                                        <div
                                            className={`sa-category-visual ${
                                                index % 3 === 0
                                                    ? "sa-category-one"
                                                    : index % 3 === 1
                                                        ? "sa-category-two"
                                                        : "sa-category-three"
                                            }`}
                                        >
                                            <img
                                                src={categoryImage}
                                                alt={category.name}
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.src =
                                                        categoryImages[
                                                            index % categoryImages.length
                                                        ];
                                                }}
                                            />

                                            <span className="sa-category-number">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                        </div>

                                        <div className="sa-category-copy">
                                            <div>
                                                <h3>{category.name}</h3>
                                                <p>
                                                    {category.description ||
                                                        `Explore our ${category.name.toLowerCase()} collection.`}
                                                </p>
                                            </div>

                                            <span className="sa-category-arrow">
                                                ↗
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
            </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section className="sa-section sa-home-featured">
            <div className="sa-container">
                <div className="sa-home-section-heading">
                    <div>
                        <span className="sa-eyebrow">
                            SELECTED FOR YOU
                        </span>
                        <h2>Featured Products</h2>
                        <p>
                            Explore selected products from our botanical
                            collection.
                        </p>
                    </div>

                    <Link to="/products" className="sa-inline-link">
                        Explore all products <span>↗</span>
                    </Link>
                </div>

                {featuredLoading && (
                    <p role="status">
                        Loading featured products...
                    </p>
                )}

                {!featuredLoading && featuredError && (
                    <div role="alert" className="sa-featured-message">
                        <p>{featuredError}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!featuredLoading &&
                    !featuredError &&
                    featuredProducts.length === 0 && (
                        <div className="sa-featured-message">
                            <h3>New discoveries are on the way.</h3>
                            <p>
                                Our featured botanical products will
                                appear here when available.
                            </p>
                            <Link to="/products" className="sa-inline-link">
                                Explore our categories <span>↗</span>
                            </Link>
                        </div>
                    )}

                {!featuredLoading &&
                    !featuredError &&
                    featuredProducts.length > 0 && (
                        <div className="sa-home-featured-grid">
                            {featuredProducts.map((product) => {
                                const productImage =
                                    Array.isArray(product.images)
                                        ? product.images[0]?.url || ""
                                        : "";

                                const categoryName =
                                    typeof product.category === "object"
                                        ? product.category?.name
                                        : "";

                                return (
                                    <article
                                        className="sa-home-featured-card"
                                        key={product._id}
                                    >
                                        <div className="sa-home-featured-image">
                                            {productImage ? (
                                                <img
                                                    src={productImage}
                                                    alt={
                                                        product.images?.[0]?.alt ||
                                                        product.name
                                                    }
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="sa-home-featured-placeholder">
                                                    SAB
                                                </div>
                                            )}

                                            <span className="sa-home-featured-badge">
                                                Featured
                                            </span>
                                        </div>

                                        <div className="sa-home-featured-content">
                                            {categoryName && (
                                                <span className="sa-eyebrow">
                                                    {categoryName}
                                                </span>
                                            )}

                                            <h3>{product.name}</h3>

                                            {product.botanicalName && (
                                                <p className="sa-home-featured-botanical">
                                                    {product.botanicalName}
                                                </p>
                                            )}

                                            <p className="sa-home-featured-description">
                                                {product.shortDescription ||
                                                    product.description ||
                                                    "Contact our team to learn more about this botanical product."}
                                            </p>

                                            <Link
                                                to={`/contact?product=${encodeURIComponent(product.name)}${categoryName ? `&category=${encodeURIComponent(categoryName)}` : ""}`}
                                                className="sa-home-featured-link"
                                            >
                                                Enquire About Product
                                                <span>↗</span>
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
            </div>
        </section>

        {/* RESEARCH SECTION */}
        <section className="sa-home-research">
            <div className="sa-container sa-home-research-grid">
                <div className="sa-home-research-copy">
                    <span className="sa-eyebrow">
                        KNOWLEDGE MEETS NATURE
                    </span>

                    <h2>
                        Exploring nature.
                        <br />
                        <span>Thinking beyond.</span>
                    </h2>

                    <p>
                        We believe responsible botanical innovation
                        begins with curiosity, careful evaluation
                        and a willingness to keep learning.
                    </p>

                    <Link
                        to="/research"
                        className="sa-button sa-button-light"
                    >
                        Discover Our Approach <span>↗</span>
                    </Link>
                </div>

                <div className="sa-research-image-wrap">
                    <img
                        src={researchImage}
                        alt="Botanical inspiration for research and development"
                    />

                    <div className="sa-research-image-label">
                        BOTANICAL KNOWLEDGE
                    </div>
                </div>
            </div>
        </section>

        {/* CONTACT CTA */}
        <section className="sa-section">
            <div className="sa-container sa-home-contact">
                <div className="sa-home-contact-mark">S</div>

                <span className="sa-eyebrow">LET'S CONNECT</span>

                <h2>
                    Have a question or an idea to explore?
                </h2>

                <p>
                    We'd welcome a conversation about botanical
                    products, research and potential collaborations.
                </p>

                <Link to="/contact" className="sa-button">
                    Get in Touch <span>↗</span>
                </Link>
            </div>
        </section>

    </div>
);


}

export default Home;
