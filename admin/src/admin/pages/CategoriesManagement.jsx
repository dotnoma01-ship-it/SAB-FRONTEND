import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../services/api.js";


function createInitialForm() {
return {
name: "",
slug: "",
description: "",
image: {
url: "",
publicId: "",
},
isActive: true,
sortOrder: 0,
};
}

function createSlug(value) {
return value
.toLowerCase()
.trim()
.replace(/[^a-z0-9]+/g, "-")
.replace(/^-+|-+$/g, "");
}

export default function CategoriesManagement() {
const [categories, setCategories] = useState([]);
const [form, setForm] = useState(createInitialForm);
const [editingId, setEditingId] = useState(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [uploadingImage, setUploadingImage] = useState(false);
const [error, setError] = useState("");
const [notice, setNotice] = useState("");
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");


const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
        const result = await apiRequest("/categories?all=true");
        setCategories(
            Array.isArray(result?.data) ? result.data : []
        );
    } catch (err) {
        setError(
            err.message ||
            "Unable to load categories. Please try again."
        );
    } finally {
        setLoading(false);
    }
}, []);

useEffect(() => {
    loadCategories();
}, [loadCategories]);

const resetForm = () => {
    setForm(createInitialForm());
    setEditingId(null);
    setError("");
    setNotice("");
};

const handleNameChange = (value) => {
    setForm((current) => ({
        ...current,
        name: value,
        slug: editingId ? current.slug : createSlug(value),
    }));
};

const handleEdit = (category) => {
    setEditingId(category._id);

    setForm({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        image: {
            url: category.image?.url || "",
            publicId: category.image?.publicId || "",
        },
        isActive: category.isActive !== false,
        sortOrder: category.sortOrder ?? 0,
    });

    setError("");
    setNotice("");

    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
};

const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
        setError("Choose a JPG, PNG, or WebP image.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        setError("The category image must not exceed 5 MB.");
        return;
    }

    const imageData = new FormData();
    imageData.append("images", file);

    setUploadingImage(true);
    setError("");
    setNotice("");

    try {
        const result = await apiRequest("/uploads/products", {
            method: "POST",
            body: imageData,
        });

        const uploadedImage = result?.data?.[0];

        if (
            !result?.success ||
            !uploadedImage?.url ||
            !uploadedImage?.publicId
        ) {
            throw new Error(
                "The upload did not return valid image details."
            );
        }

        setForm((current) => ({
            ...current,
            image: {
                url: uploadedImage.url,
                publicId: uploadedImage.publicId,
            },
        }));

        setNotice("Category image uploaded successfully.");
    } catch (err) {
        setError(
            err.message ||
            "Unable to upload the category image."
        );
    } finally {
        setUploadingImage(false);
    }
};

const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const name = form.name.trim();
    const slug = createSlug(form.slug);

    if (!name || !slug) {
        setError("Category name and slug are required.");
        return;
    }

    const sortOrder = Number(form.sortOrder);

    if (
        !Number.isFinite(sortOrder) ||
        !Number.isInteger(sortOrder) ||
        sortOrder < 0
    ) {
        setError(
            "Display order must be a non-negative whole number."
        );
        return;
    }

    const payload = {
        ...form,
        name,
        slug,
        description: form.description.trim(),
        image: {
            url: form.image.url,
            publicId: form.image.publicId,
        },
        sortOrder,
    };

    setSaving(true);

    try {
        const endpoint = editingId
    ? "/categories/" + editingId
    : "/categories";

        const result = await apiRequest(endpoint, {
            method: editingId ? "PUT" : "POST",
            body: JSON.stringify(payload),
        });

        if (result?.success === false) {
            throw new Error(
                result.message || "Unable to save the category."
            );
        }

        setNotice(
            editingId
                ? "Category updated successfully."
                : "Category created successfully."
        );

        setForm(createInitialForm());
        setEditingId(null);

        await loadCategories();
    } catch (err) {
        setError(
            err.message || "Unable to save the category."
        );
    } finally {
        setSaving(false);
    }
};

const handleToggleStatus = async (category) => {
    setError("");
    setNotice("");

    try {
        const result = await apiRequest(
            "/categories/" + category._id,
            {
                method: "PUT",
                body: JSON.stringify({
                    isActive: !category.isActive,
                }),
            }
        );

        if (result?.success === false) {
            throw new Error(
                result.message ||
                "Unable to update category status."
            );
        }

        setNotice(
            category.isActive
                ? "Category deactivated."
                : "Category activated."
        );

        await loadCategories();
    } catch (err) {
        setError(
            err.message ||
            "Unable to update category status."
        );
    }
};

const handleDelete = async (category) => {
   const confirmed = window.confirm(
"Delete category " + category.name + "? This cannot be undone. Categories assigned to products cannot be deleted."
);

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
        const result = await apiRequest(
            "/categories/" + category._id,
            {
                method: "DELETE",
            }
        );

        if (result?.success === false) {
            throw new Error(
                result.message || "Unable to delete the category."
            );
        }

        if (editingId === category._id) {
            setForm(createInitialForm());
            setEditingId(null);
        }

        setNotice("Category deleted successfully.");
        await loadCategories();
    } catch (err) {
        setError(
            err.message || "Unable to delete the category."
        );
    }
};

const filteredCategories = categories.filter((category) => {
    const searchText = [
        category.name,
        category.slug,
        category.description,
    ]
        .join(" ")
        .toLowerCase();

    const matchesSearch = searchText.includes(
        search.trim().toLowerCase()
    );

    const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.isActive) ||
        (statusFilter === "inactive" && !category.isActive);

    return matchesSearch && matchesStatus;
});

const activeCount = categories.filter(
    (category) => category.isActive
).length;

const inactiveCount = categories.length - activeCount;

return (
    <section className="management-page">
        <div className="management-heading">
            <div>
                <span className="eyebrow">CATALOGUE</span>
                <h2>Categories</h2>
                <p>
                    Organize your products into meaningful categories.
                </p>
            </div>

            <button
                type="button"
                className="btn btn-secondary"
                onClick={loadCategories}
                disabled={loading}
            >
                {loading ? "Refreshing..." : "Refresh"}
            </button>
        </div>

        {error && (
            <div
                className="form-message form-message-error"
                role="alert"
            >
                {error}
            </div>
        )}

        {notice && (
            <div
                className="form-message form-message-success"
                role="status"
            >
                {notice}
            </div>
        )}

        <div className="management-stats">
            <article className="management-stat-card">
                <span>Total categories</span>
                <strong>{categories.length}</strong>
            </article>

            <article className="management-stat-card">
                <span>Active categories</span>
                <strong>{activeCount}</strong>
            </article>

            <article className="management-stat-card">
                <span>Inactive categories</span>
                <strong>{inactiveCount}</strong>
            </article>
        </div>

        <div className="category-layout">
            <section className="management-card category-form-card">
                <div className="management-card-heading">
                    <div>
                        <h3>
                            {editingId ? "Edit category" : "Add category"}
                        </h3>
                        <p>
                            {editingId
                                ? "Update the category details below."
                                : "Create a category for your product catalogue."}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="category-form"
                >
                    <label className="form-field">
                        <span>Category name *</span>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(event) =>
                                handleNameChange(event.target.value)
                            }
                            placeholder="e.g. Herbal Supplements"
                            maxLength={100}
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>URL slug *</span>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    slug: createSlug(event.target.value),
                                }))
                            }
                            placeholder="herbal-supplements"
                            maxLength={120}
                            required
                        />
                        <small>
                            Used in category URLs. Spaces become hyphens.
                        </small>
                    </label>

                    <label className="form-field">
                        <span>Description</span>
                        <textarea
                            value={form.description}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    description: event.target.value,
                                }))
                            }
                            placeholder="Describe the products in this category."
                            rows={4}
                            maxLength={500}
                        />
                    </label>

                    <label className="form-field">
                        <span>Display order</span>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={form.sortOrder}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    sortOrder: event.target.value,
                                }))
                            }
                        />
                        <small>
                            Smaller numbers appear first.
                        </small>
                    </label>

                    <div className="form-field">
                        <span>Category image</span>

                        {form.image.url && (
                            <div className="category-image-preview">
                                <img
                                    src={form.image.url}
                                   alt={(form.name || "Category") + " preview"}
                                />

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setForm((current) => ({
                                            ...current,
                                            image: {
                                                url: "",
                                                publicId: "",
                                            },
                                        }))
                                    }
                                    disabled={uploadingImage}
                                >
                                    Remove image
                                </button>
                            </div>
                        )}

                        <label className="category-image-picker">
                            <span>
                                {uploadingImage
                                    ? "Uploading image..."
                                    : "Choose category image"}
                            </span>
                            <small>
                                JPG, PNG, or WebP. Maximum 5 MB.
                            </small>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageChange}
                                disabled={uploadingImage}
                            />
                        </label>
                    </div>

                    <label className="category-checkbox">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    isActive: event.target.checked,
                                }))
                            }
                        />
                        <span>Category is active</span>
                    </label>

                    <div className="category-form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving || uploadingImage}
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Save changes"
                                    : "Create category"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={resetForm}
                                disabled={saving || uploadingImage}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="management-card category-list-card">
                <div className="management-card-heading">
                    <div>
                        <h3>All categories</h3>
                        <p>
                            {filteredCategories.length} of{" "}
                            {categories.length} categories
                        </p>
                    </div>
                </div>

                <div className="category-list-filters">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search categories..."
                        aria-label="Search categories"
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        aria-label="Filter categories by status"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {loading ? (
                    <div className="management-empty-state">
                        <p>Loading categories...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="management-empty-state">
                        <span className="empty-state-icon">▤</span>
                        <h3>
                            {categories.length === 0
                                ? "No categories yet"
                                : "No matching categories"}
                        </h3>
                        <p>
                            {categories.length === 0
                                ? "Create your first category using the form."
                                : "Try another search term or status filter."}
                        </p>
                    </div>
                ) : (
                    <div className="category-list">
                        {filteredCategories.map((category) => (
                            <article
                                className="category-list-item"
                                key={category._id}
                            >
                                <div className="category-list-image">
                                    {category.image?.url ? (
                                        <img
                                            src={category.image.url}
                                            alt={category.name}
                                        />
                                    ) : (
                                        <span>▤</span>
                                    )}
                                </div>

                                <div className="category-list-details">
                                    <h4>{category.name}</h4>
                                    <span className="category-slug">
                                        {category.slug}
                                    </span>

                                    {category.description && (
                                        <p>{category.description}</p>
                                    )}

                                    <span
                                       className={"category-status " + (category.isActive ? "is-active" : "is-inactive")}

                                    >
                                        {category.isActive
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>

                                <div className="category-list-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            handleEdit(category)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            handleToggleStatus(category)
                                        }
                                    >
                                        {category.isActive
                                            ? "Deactivate"
                                            : "Activate"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() =>
                                            handleDelete(category)
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    </section>
);


}
