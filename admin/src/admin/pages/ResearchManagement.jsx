import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../../services/api.js";

const EMPTY_FORM = {
title: "",
summary: "",
content: "",
coverImageUrl: "",
coverImagePublicId: "",
coverImageAlt: "",
status: "draft",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
"image/jpeg",
"image/png",
"image/webp",
];

const formatDate = (date) => {
if (!date) return "—";


return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
});


};

export default function ResearchManagement() {
const [articles, setArticles] = useState([]);
const [form, setForm] = useState(EMPTY_FORM);
const [editingId, setEditingId] = useState(null);
const [formOpen, setFormOpen] = useState(false);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [uploadingImage, setUploadingImage] = useState(false);
const [imagePreview, setImagePreview] = useState("");
const [error, setError] = useState("");
const [notice, setNotice] = useState("");
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");


const fileInputRef = useRef(null);
const previewObjectUrlRef = useRef("");

const clearLocalPreview = useCallback(() => {
    if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = "";
    }
}, []);

useEffect(() => {
    return () => {
        clearLocalPreview();
    };
}, [clearLocalPreview]);

const loadArticles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
        const result = await apiRequest("/articles/admin/all");

        setArticles(Array.isArray(result?.data) ? result.data : []);
    } catch (err) {
        setError(err.message || "Unable to load articles.");
    } finally {
        setLoading(false);
    }
}, []);

useEffect(() => {
    loadArticles();
}, [loadArticles]);

const openNewArticle = () => {
    clearLocalPreview();

    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setImagePreview("");
    setNotice("");
    setError("");
    setFormOpen(true);

    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
};

const openEditArticle = (article) => {
    clearLocalPreview();

    setEditingId(article._id);

    setForm({
        title: article.title || "",
        summary: article.summary || "",
        content: article.content || "",
        coverImageUrl: article.coverImage?.url || "",
        coverImagePublicId: article.coverImage?.publicId || "",
        coverImageAlt: article.coverImage?.alt || "",
        status: article.status || "draft",
    });

    setImagePreview(article.coverImage?.url || "");
    setNotice("");
    setError("");
    setFormOpen(true);

    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
};

const closeForm = () => {
    clearLocalPreview();

    setFormOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setImagePreview("");
    setError("");
    setUploadingImage(false);

    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
};

const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
        ...current,
        [name]: value,
    }));
};

const handleCoverImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setNotice("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError("Choose a JPG, PNG, or WebP image.");
        event.target.value = "";
        return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
        setError("The cover image must not exceed 5 MB.");
        event.target.value = "";
        return;
    }

    clearLocalPreview();

    const localPreviewUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = localPreviewUrl;
    setImagePreview(localPreviewUrl);

    setUploadingImage(true);

    try {
        const uploadData = new FormData();
        uploadData.append("image", file);

        const result = await apiRequest("/uploads/articles", {
            method: "POST",
            body: uploadData,
        });

        const uploadedImage = result?.data;

        if (!uploadedImage?.url || !uploadedImage?.publicId) {
            throw new Error(
                "The upload response did not contain a valid image."
            );
        }

        clearLocalPreview();

        setForm((current) => ({
            ...current,
            coverImageUrl: uploadedImage.url,
            coverImagePublicId: uploadedImage.publicId,
            coverImageAlt:
                current.coverImageAlt.trim() ||
                uploadedImage.alt ||
                file.name,
        }));

        setImagePreview(uploadedImage.url);

        setNotice("Cover image uploaded successfully.");
    } catch (err) {
        clearLocalPreview();

        setImagePreview((current) =>
            current === localPreviewUrl
                ? form.coverImageUrl || ""
                : current
        );

        setError(
            err.message ||
            "Unable to upload the cover image. Please try again."
        );
    } finally {
        setUploadingImage(false);
        event.target.value = "";
    }
};

const handleSubmit = async (event) => {
    event.preventDefault();

    if (uploadingImage) {
        setError("Please wait for the cover image upload to finish.");
        return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content.trim(),
        coverImage: {
            url: form.coverImageUrl.trim(),
            publicId: form.coverImagePublicId,
            alt: form.coverImageAlt.trim(),
        },
        status: form.status,
    };

    try {
        const result = await apiRequest(
            editingId ? `/articles/${editingId}` : "/articles",
            {
                method: editingId ? "PUT" : "POST",
                body: JSON.stringify(payload),
            }
        );

        setNotice(
            result?.message ||
            (editingId
                ? "Article updated successfully."
                : "Article created successfully.")
        );

        closeForm();
        await loadArticles();
    } catch (err) {
        setError(err.message || "Unable to save article.");
    } finally {
        setSaving(false);
    }
};

const handleDelete = async (article) => {
    const confirmed = window.confirm(
        `Delete "${article.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
        const result = await apiRequest(`/articles/${article._id}`, {
            method: "DELETE",
        });

        setNotice(result?.message || "Article deleted successfully.");

        if (editingId === article._id) {
            closeForm();
        }

        await loadArticles();
    } catch (err) {
        setError(err.message || "Unable to delete article.");
    }
};

const handleStatusChange = async (article, status) => {
    setError("");
    setNotice("");

    try {
        const result = await apiRequest(`/articles/${article._id}`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        });

        setNotice(
            result?.message ||
            `Article ${
                status === "published"
                    ? "published"
                    : "saved as draft"
            }.`
        );

        await loadArticles();
    } catch (err) {
        setError(err.message || "Unable to update article status.");
    }
};

const filteredArticles = articles.filter((article) => {
    const matchesSearch = [
        article.title,
        article.summary,
        article.slug,
    ].some((value) =>
        String(value || "")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const matchesStatus =
        statusFilter === "all" || article.status === statusFilter;

    return matchesSearch && matchesStatus;
});

const publishedCount = articles.filter(
    (article) => article.status === "published"
).length;

const draftCount = articles.filter(
    (article) => article.status === "draft"
).length;

return (
    <section className="management-page research-management">
        <div className="management-heading">
            <div>
                <span className="eyebrow">KNOWLEDGE CENTRE</span>
                <h2>Research & Articles</h2>
                <p>
                    Create and manage botanical research, educational
                    articles, and company publications.
                </p>
            </div>

            <button
                type="button"
                className="primary-button"
                onClick={openNewArticle}
            >
                + New Article
            </button>
        </div>

        {notice && (
            <div
                className="research-notice research-notice-success"
                role="status"
            >
                {notice}
            </div>
        )}

        {error && (
            <div
                className="research-notice research-notice-error"
                role="alert"
            >
                {error}
            </div>
        )}

        <div className="research-stats">
            <div className="research-stat-card">
                <span>Total Articles</span>
                <strong>{articles.length}</strong>
            </div>

            <div className="research-stat-card">
                <span>Published</span>
                <strong>{publishedCount}</strong>
            </div>

            <div className="research-stat-card">
                <span>Drafts</span>
                <strong>{draftCount}</strong>
            </div>
        </div>

        {formOpen && (
            <div className="research-form-card">
                <div className="research-form-heading">
                    <div>
                        <span className="eyebrow">
                            {editingId
                                ? "EDIT PUBLICATION"
                                : "NEW PUBLICATION"}
                        </span>

                        <h3>
                            {editingId
                                ? "Edit article"
                                : "Create an article"}
                        </h3>
                    </div>

                    <button
                        type="button"
                        className="research-close-button"
                        onClick={closeForm}
                        aria-label="Close article form"
                        disabled={saving || uploadingImage}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="research-form">
                    <label>
                        Article title

                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            maxLength={200}
                            placeholder="e.g. Understanding Botanical Extracts"
                            required
                        />
                    </label>

                    <label>
                        Short summary

                        <textarea
                            name="summary"
                            value={form.summary}
                            onChange={handleChange}
                            maxLength={500}
                            rows={3}
                            placeholder="A brief introduction to the article..."
                            required
                        />

                        <small>
                            {form.summary.length}/500 characters
                        </small>
                    </label>

                    <label>
                        Article content

                        <textarea
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                            rows={10}
                            placeholder="Write the complete article here..."
                            required
                        />
                    </label>

                    <div className="research-form-grid">
                        <label>
                            Upload cover image

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleCoverImageUpload}
                                disabled={uploadingImage || saving}
                            />

                            <small>
                                JPG, PNG or WebP. Maximum file size: 5 MB.
                            </small>
                        </label>

                        <label>
                            Image description

                            <input
                                type="text"
                                name="coverImageAlt"
                                value={form.coverImageAlt}
                                onChange={handleChange}
                                maxLength={200}
                                placeholder="Describe the cover image"
                            />
                        </label>
                    </div>

                    {uploadingImage && (
                        <div
                            className="research-notice"
                            role="status"
                        >
                            Uploading cover image to Cloudinary...
                        </div>
                    )}

                    {imagePreview && (
                        <div className="research-image-preview">
                            <img
                                src={imagePreview}
                                alt={
                                    form.coverImageAlt ||
                                    "Article cover preview"
                                }
                                onError={(event) => {
                                    event.currentTarget.style.display =
                                        "none";
                                }}
                            />

                            <p>
                                {uploadingImage
                                    ? "Previewing selected image..."
                                    : "Cover image preview"}
                            </p>
                        </div>
                    )}

                    <label>
                        Publication status

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="draft">
                                Draft — not public
                            </option>

                            <option value="published">
                                Published — visible publicly
                            </option>
                        </select>
                    </label>

                    <div className="research-form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={closeForm}
                            disabled={saving || uploadingImage}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving || uploadingImage}
                        >
                            {uploadingImage
                                ? "Uploading Image..."
                                : saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Save Changes"
                                        : "Create Article"}
                        </button>
                    </div>
                </form>
            </div>
        )}

        <div className="research-toolbar">
            <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search articles..."
                aria-label="Search articles"
            />

            <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter articles by status"
            >
                <option value="all">All articles</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
            </select>

            <button
                type="button"
                className="secondary-button"
                onClick={loadArticles}
                disabled={loading}
            >
                Refresh
            </button>
        </div>

        <div className="research-table-card">
            {loading ? (
                <div className="research-empty-state">
                    Loading articles...
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="research-empty-state">
                    <span className="empty-state-icon">✎</span>

                    <h3>
                        {articles.length === 0
                            ? "Your research library is ready"
                            : "No matching articles"}
                    </h3>

                    <p>
                        {articles.length === 0
                            ? "Create your first article to start building your botanical knowledge centre."
                            : "Try another search term or change the status filter."}
                    </p>

                    {articles.length === 0 && (
                        <button
                            type="button"
                            className="primary-button"
                            onClick={openNewArticle}
                        >
                            Create First Article
                        </button>
                    )}
                </div>
            ) : (
                <div className="research-table-scroll">
                    <table className="research-table">
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th>Status</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredArticles.map((article) => (
                                <tr key={article._id}>
                                    <td>
                                        <div className="research-article-cell">
                                            {article.coverImage?.url ? (
                                                <img
                                                    src={article.coverImage.url}
                                                    alt={
                                                        article.coverImage.alt ||
                                                        ""
                                                    }
                                                />
                                            ) : (
                                                <div className="research-table-placeholder">
                                                    ✎
                                                </div>
                                            )}

                                            <div>
                                                <strong>
                                                    {article.title}
                                                </strong>

                                                <span>
                                                    {article.summary?.length > 90
                                                        ? `${article.summary.slice(0, 90)}...`
                                                        : article.summary}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <span
                                            className={`research-status research-status-${article.status}`}
                                        >
                                            {article.status === "published"
                                                ? "Published"
                                                : "Draft"}
                                        </span>
                                    </td>

                                    <td>
                                        {formatDate(article.updatedAt)}
                                    </td>

                                    <td>
                                        <div className="research-row-actions">
                                            <button
                                                type="button"
                                                className="research-action-button"
                                                onClick={() =>
                                                    openEditArticle(article)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="research-action-button"
                                                onClick={() =>
                                                    handleStatusChange(
                                                        article,
                                                        article.status ===
                                                            "published"
                                                            ? "draft"
                                                            : "published"
                                                    )
                                                }
                                            >
                                                {article.status ===
                                                "published"
                                                    ? "Unpublish"
                                                    : "Publish"}
                                            </button>

                                            <button
                                                type="button"
                                                className="research-action-button research-delete-button"
                                                onClick={() =>
                                                    handleDelete(article)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </section>
);

}
