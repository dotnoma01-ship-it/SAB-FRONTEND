import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://sab-frontend-bh7q.onrender.com/api";

const researchAreas = [
{
number: "01",
label: "BOTANICAL KNOWLEDGE",
title: "Understanding plant resources",
description:
"Explore botanical identity, plant characteristics, origins, and the knowledge that helps us better understand natural resources.",
image: "/images/botanical-research.jpg",
alt: "Botanical research and plant materials",
},
{
number: "02",
label: "RESPONSIBLE SOURCING",
title: "Respecting nature and origin",
description:
"Recognise the importance of responsible sourcing, resource traceability, and practices that respect natural ecosystems.",
image: "/images/botanical-ingredients.jpg",
alt: "Natural botanical ingredients",
},
{
number: "03",
label: "INGREDIENT EXPLORATION",
title: "Exploring botanical potential",
description:
"Examine the possibilities of plant-derived materials for ingredient development, research, and future applications.",
image: "/images/botanical-extracts.jpg",
alt: "Plant-derived botanical extracts",
},
];

const principles = [
{
number: "01",
title: "Evidence-led thinking",
description:
"Approach botanical information with curiosity, critical evaluation, and respect for available scientific evidence.",
},
{
number: "02",
title: "Responsible practices",
description:
"Consider the origin of natural resources and the importance of traceability and responsible resource management.",
},
{
number: "03",
title: "Continuous discovery",
description:
"Remain open to learning, collaboration, and new perspectives that can deepen our understanding of botanicals.",
},
];

function formatDate(date) {
if (!date) return "";


const parsedDate = new Date(date);

if (Number.isNaN(parsedDate.getTime())) return "";

return parsedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
});


}

function Research() {
const [articles, setArticles] = useState([]);
const [articlesLoading, setArticlesLoading] = useState(true);
const [articlesError, setArticlesError] = useState("");


useEffect(() => {
    const controller = new AbortController();

    async function loadArticles() {
        setArticlesLoading(true);
        setArticlesError("");

        try {
            const response = await fetch(`${API_BASE_URL}/articles`, {
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(
                    "We couldn't load the research articles. Please try again later."
                );
            }

            const result = await response.json();

            if (result?.success === false) {
                throw new Error(
                    result.message || "Unable to load research articles."
                );
            }

            const publishedArticles = Array.isArray(result?.data)
                ? result.data.filter(
                    (article) => article.status === "published"
                )
                : [];

            setArticles(publishedArticles);
        } catch (error) {
            if (error.name !== "AbortError") {
                setArticlesError(
                    error.message ||
                    "Something went wrong while loading research articles."
                );
            }
        } finally {
            if (!controller.signal.aborted) {
                setArticlesLoading(false);
            }
        }
    }

    loadArticles();

    return () => controller.abort();
}, []);

return (
    <div className="sa-research-page">
        <section className="sa-research-hero">
            <div className="sa-research-hero-image">
                <img
                    src="/images/botanical-research.jpg"
                    alt="Green botanical foliage representing research and discovery"
                />
            </div>

            <div className="sa-research-hero-overlay"></div>

            <div className="sa-container sa-research-hero-content">
                <span className="sa-eyebrow">
                    KNOWLEDGE · NATURE · INNOVATION
                </span>

                <h1>
                    Exploring nature.
                    <br />
                    <span>Understanding potential.</span>
                </h1>

                <p>
                    A considered approach to botanical knowledge,
                    responsible sourcing, and the exploration of
                    plant-derived resources.
                </p>

                <div className="sa-research-hero-actions">
                    <a
                        href="#research-areas"
                        className="sa-research-primary-button"
                    >
                        Explore Our Focus <span>↘</span>
                    </a>

                    <Link
                        to="/contact"
                        className="sa-research-text-button"
                    >
                        Connect With Us ↗
                    </Link>
                </div>

                <div className="sa-research-hero-note">
                    <span></span>
                    A CURIOSITY-DRIVEN APPROACH TO BOTANICALS
                </div>
            </div>
        </section>

        <section className="sa-research-intro">
            <div className="sa-container sa-research-intro-grid">
                <div>
                    <span className="sa-eyebrow">
                        OUR RESEARCH PERSPECTIVE
                    </span>

                    <h2>
                        Better understanding begins with
                        <span> better questions.</span>
                    </h2>
                </div>

                <div className="sa-research-intro-copy">
                    <p>
                        The botanical world offers an extensive field for
                        learning and exploration. At Sought After
                        Botaceutical, our research perspective centres on
                        understanding plant resources, examining relevant
                        knowledge, and recognising opportunities for
                        responsible innovation.
                    </p>

                    <p>
                        We believe thoughtful exploration should be guided
                        by curiosity, careful evaluation, and respect for
                        the natural world.
                    </p>
                </div>
            </div>
        </section>

        <section
            className="sa-research-areas"
            id="research-areas"
        >
            <div className="sa-container">
                <div className="sa-research-section-heading">
                    <div>
                        <span className="sa-eyebrow">
                            AREAS OF INTEREST
                        </span>

                        <h2>Where knowledge meets nature.</h2>
                    </div>

                    <p>
                        Our areas of interest reflect a commitment to
                        learning, responsible practices, and the potential
                        of botanical resources.
                    </p>
                </div>

                <div className="sa-research-area-grid">
                    {researchAreas.map((area) => (
                        <article
                            className="sa-research-area-card"
                            key={area.number}
                        >
                            <div className="sa-research-area-image">
                                <img
                                    src={area.image}
                                    alt={area.alt}
                                    loading="lazy"
                                />

                                <span className="sa-research-area-number">
                                    {area.number}
                                </span>
                            </div>

                            <div className="sa-research-area-content">
                                <span className="sa-research-area-label">
                                    {area.label}
                                </span>

                                <h3>{area.title}</h3>

                                <p>{area.description}</p>

                                <Link
                                    to="/contact"
                                    className="sa-research-card-link"
                                >
                                    Enquire about this area <span>↗</span>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>

        {/* Dynamic articles managed from the SAB admin panel */}
        <section
            className="sa-publications"
            id="research-publications"
        >
            <div className="sa-container">
                <div className="sa-publications-heading">
                    <div>
                        <span className="sa-eyebrow">
                            FROM OUR KNOWLEDGE CENTRE
                        </span>

                        <h2>Research & Articles</h2>

                        <p>
                            Discover botanical insights, educational
                            resources, and publications from SAB.
                        </p>
                    </div>

                    <span className="sa-publications-count">
                        {articlesLoading
                            ? "Loading..."
                            : `${articles.length} ${
                                articles.length === 1
                                    ? "ARTICLE"
                                    : "ARTICLES"
                            }`}
                    </span>
                </div>

                {articlesLoading ? (
                    <div className="sa-publications-state">
                        <span className="sa-publications-loader"></span>

                        <p>
                            Loading our latest research and articles...
                        </p>
                    </div>
                ) : articlesError ? (
                    <div
                        className="sa-publications-state sa-publications-error"
                        role="alert"
                    >
                        <h3>Articles are temporarily unavailable</h3>

                        <p>{articlesError}</p>

                        <button
                            type="button"
                            className="sa-publications-retry"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="sa-publications-state">
                        <span className="sa-publications-empty-icon">
                            ✳
                        </span>

                        <h3>Knowledge worth sharing is on its way.</h3>

                        <p>
                            Our research articles will appear here as
                            publications become available.
                        </p>
                    </div>
                ) : (
                    <div className="sa-publications-grid">
                        {articles.map((article) => (
                            <article
                                className="sa-publication-card"
                                key={article._id}
                            >
                                <Link
                                    to={`/research/${article.slug}`}
                                    className="sa-publication-image"
                                    aria-label={`Read ${article.title}`}
                                >
                                    {article.coverImage?.url ? (
                                        <img
                                            src={article.coverImage.url}
                                            alt={
                                                article.coverImage.alt ||
                                                article.title
                                            }
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="sa-publication-image-placeholder">
                                            <span>✳</span>
                                            <small>SAB KNOWLEDGE CENTRE</small>
                                        </div>
                                    )}

                                    <span className="sa-publication-image-arrow">
                                        ↗
                                    </span>
                                </Link>

                                <div className="sa-publication-content">
                                    <div className="sa-publication-meta">
                                        <span>BOTANICAL INSIGHTS</span>

                                        {formatDate(article.createdAt) && (
                                            <time
                                                dateTime={article.createdAt}
                                            >
                                                {formatDate(article.createdAt)}
                                            </time>
                                        )}
                                    </div>

                                    <h3>
                                        <Link
                                            to={`/research/${article.slug}`}
                                        >
                                            {article.title}
                                        </Link>
                                    </h3>

                                    <p>
                                        {article.summary}
                                    </p>

                                    <Link
                                        to={`/research/${article.slug}`}
                                        className="sa-publication-read-link"
                                    >
                                        Read Article <span>↗</span>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>

        <section className="sa-research-principles">
            <div className="sa-container sa-research-principles-grid">
                <div className="sa-research-principles-heading">
                    <span className="sa-eyebrow">
                        GUIDING PRINCIPLES
                    </span>

                    <h2>
                        Thoughtful exploration.
                        <span> Responsible progress.</span>
                    </h2>

                    <p>
                        The way we approach botanical knowledge matters as
                        much as the questions we ask.
                    </p>

                    <Link
                        to="/about"
                        className="sa-research-about-link"
                    >
                        Learn About SAB <span>↗</span>
                    </Link>
                </div>

                <div className="sa-research-principle-list">
                    {principles.map((principle) => (
                        <article
                            className="sa-research-principle"
                            key={principle.number}
                        >
                            <span className="sa-research-principle-number">
                                {principle.number}
                            </span>

                            <div>
                                <h3>{principle.title}</h3>
                                <p>{principle.description}</p>
                            </div>

                            <span className="sa-research-principle-arrow">
                                ↗
                            </span>
                        </article>
                    ))}
                </div>
            </div>
        </section>

        <section className="sa-research-collaboration">
            <div className="sa-container">
                <div className="sa-research-collaboration-panel">
                    <div className="sa-research-collaboration-decoration">
                        <span>✳</span>
                    </div>

                    <div className="sa-research-collaboration-content">
                        <span className="sa-eyebrow">
                            LET'S START A CONVERSATION
                        </span>

                        <h2>
                            Have a botanical research
                            <span>
                                {" "}enquiry or collaboration in mind?
                            </span>
                        </h2>

                        <p>
                            Contact our team to discuss your interests,
                            questions, or potential areas of collaboration.
                        </p>

                        <Link
                            to="/contact"
                            className="sa-research-primary-button"
                        >
                            Contact Our Team <span>↗</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    </div>
);


}

export default Research;

