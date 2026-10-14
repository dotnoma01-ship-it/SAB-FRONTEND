import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:5002/api";

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

export default function ResearchArticle() {
const { slug } = useParams();


const [article, setArticle] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
    const controller = new AbortController();

    async function loadArticle() {
        setLoading(true);
        setError("");
        setArticle(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/articles/slug/${encodeURIComponent(slug)}`,
                { signal: controller.signal }
            );

            const result = await response.json();

            if (!response.ok || !result.success || !result.data) {
                throw new Error(
                    response.status === 404
                        ? "This article could not be found. It may have been removed or unpublished."
                        : result.message || "Unable to load this article."
                );
            }

            setArticle(result.data);
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(
                    err.message ||
                    "Something went wrong while loading this article."
                );
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }

    loadArticle();

    return () => controller.abort();
}, [slug]);

if (loading) {
    return (
        <div className="sa-article-state">
            <span className="sa-publications-loader"></span>
            <p>Loading research article...</p>
        </div>
    );
}

if (error || !article) {
    return (
        <section className="sa-article-state">
            <span className="sa-article-state-icon">✳</span>
            <h1>Article unavailable</h1>
            <p>{error || "We couldn't find this article."}</p>
            <Link
                to="/research"
                className="sa-research-primary-button"
            >
                Back to Research <span>↗</span>
            </Link>
        </section>
    );
}

return (
    <article className="sa-article-page">
        <div className="sa-container sa-article-container">
            <nav className="sa-article-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/research">Research</Link>
                <span>/</span>
                <span className="sa-article-breadcrumb-current">
                    Article
                </span>
            </nav>

            <header className="sa-article-header">
                <span className="sa-eyebrow">
                    SAB KNOWLEDGE CENTRE
                </span>

                <h1>{article.title}</h1>

                {article.summary && (
                    <p className="sa-article-summary">
                        {article.summary}
                    </p>
                )}

                <div className="sa-article-meta">
                    {formatDate(article.createdAt) && (
                        <time dateTime={article.createdAt}>
                            Published {formatDate(article.createdAt)}
                        </time>
                    )}

                    {article.author?.name && (
                        <>
                            <span aria-hidden="true">·</span>
                            <span>By {article.author.name}</span>
                        </>
                    )}
                </div>
            </header>

            {article.coverImage?.url && (
                <figure className="sa-article-cover">
                    <img
                        src={article.coverImage.url}
                        alt={
                            article.coverImage.alt ||
                            article.title
                        }
                    />
                </figure>
            )}

            <div className="sa-article-body-layout">
                <div className="sa-article-body">
                    <div className="sa-article-body-label">
                        THE ARTICLE
                    </div>

                    <div className="sa-article-content">
                        {article.content}
                    </div>
                </div>

                <aside className="sa-article-sidebar">
                    <div className="sa-article-sidebar-card">
                        <span className="sa-eyebrow">
                            SOUGHT AFTER BOTACEUTICAL
                        </span>

                        <h2>Knowledge. Nature. Discovery.</h2>

                        <p>
                            Explore more botanical insights and
                            educational resources from SAB.
                        </p>

                        <Link
                            to="/research"
                            className="sa-article-sidebar-link"
                        >
                            Explore More Articles <span>↗</span>
                        </Link>
                    </div>
                </aside>
            </div>

            <footer className="sa-article-footer">
                <Link
                    to="/research"
                    className="sa-research-primary-button"
                >
                    <span aria-hidden="true">←</span>
                    Back to Research
                </Link>
            </footer>
        </div>
    </article>
);


}
