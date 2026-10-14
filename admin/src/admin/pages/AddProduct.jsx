import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiRequest from "../../services/api.js";

const initialForm = {
name: "",
botanicalName: "",
category: "",
shortDescription: "",
description: "",
benefits: "",
ingredients: "",
usageInstructions: "",
isFeatured: false,
status: "draft",
};

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AddProduct() {
const navigate = useNavigate();

const [form, setForm] = useState(initialForm);
const [categories, setCategories] = useState([]);
const [selectedImages, setSelectedImages] = useState([]);
const [loadingCategories, setLoadingCategories] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

useEffect(() => {
    let active = true;

    async function loadCategories() {
        try {
            const result = await apiRequest("/categories");

            if (active) {
                setCategories(
                    Array.isArray(result?.data) ? result.data : []
                );
            }
        } catch (err) {
            if (active) {
                setError(
                    err.message || "Unable to load product categories."
                );
            }
        } finally {
            if (active) {
                setLoadingCategories(false);
            }
        }
    }

    loadCategories();

    return () => {
        active = false;
    };
}, []);

useEffect(() => {
    return () => {
        selectedImages.forEach((image) => {
            URL.revokeObjectURL(image.preview);
        });
    };
}, [selectedImages]);

function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
        ...current,
        [name]: type === "checkbox" ? checked : value,
    }));
}

function handleImageChange(event) {
    const files = Array.from(event.target.files || []);

    event.target.value = "";

    setError("");
    setSuccess("");

    if (files.length === 0) {
        return;
    }

    if (selectedImages.length + files.length > MAX_IMAGES) {
        setError(`You can select a maximum of ${MAX_IMAGES} images.`);
        return;
    }

    const invalidType = files.find(
        (file) => !ALLOWED_TYPES.includes(file.type)
    );

    if (invalidType) {
        setError("Only JPG, PNG, and WebP images are allowed.");
        return;
    }

    const oversizedFile = files.find(
        (file) => file.size > MAX_IMAGE_SIZE
    );

    if (oversizedFile) {
        setError("Each image must be 5 MB or smaller.");
        return;
    }

    const newImages = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
    }));

    setSelectedImages((current) => [...current, ...newImages]);
}

function removeImage(indexToRemove) {
    setSelectedImages((current) =>
        current.filter((_, index) => index !== indexToRemove)
    );
}

function splitList(value) {
    return value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}

async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
        setError("Please enter the product name.");
        return;
    }

    if (!form.category) {
        setError("Please select a product category.");
        return;
    }

    if (
        !form.shortDescription.trim() ||
        !form.description.trim()
    ) {
        setError("Please complete both product descriptions.");
        return;
    }

    setSaving(true);

    try {
        let uploadedImages = [];

        if (selectedImages.length > 0) {
            setSuccess("Uploading product images...");

            const imageData = new FormData();

            selectedImages.forEach(({ file }) => {
                imageData.append("images", file);
            });

            const uploadResult = await apiRequest(
                "/uploads/products",
                {
                    method: "POST",
                    body: imageData,
                }
            );

            if (
                !uploadResult?.success ||
                !Array.isArray(uploadResult.data) ||
                uploadResult.data.length !== selectedImages.length
            ) {
                throw new Error(
                    "The image upload did not complete successfully."
                );
            }

            uploadedImages = uploadResult.data;
        }

        setSuccess("Saving product details...");

        const payload = {
            name: form.name.trim(),
            botanicalName: form.botanicalName.trim(),
            category: form.category,
            shortDescription: form.shortDescription.trim(),
            description: form.description.trim(),
            benefits: splitList(form.benefits),
            ingredients: splitList(form.ingredients),
            usageInstructions: form.usageInstructions.trim(),
            isFeatured: form.isFeatured,
            status: form.status,
            images: uploadedImages,
        };

        await apiRequest("/products", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        setSuccess("Product created successfully!");

        window.setTimeout(() => {
            navigate("/admin/products");
        }, 1000);
    } catch (err) {
        setError(
            err.message || "Unable to create the product."
        );
        setSuccess("");
    } finally {
        setSaving(false);
    }
}

return (
    <section className="management-page">
        <div className="management-heading">
            <div>
                <span className="eyebrow">CATALOGUE</span>
                <h2>Add Product</h2>
                <p>Prepare a new botanical product listing.</p>
            </div>

            <Link
                className="secondary-button"
                to="/admin/products"
            >
                ← Back to Products
            </Link>
        </div>

        {error && (
            <div className="product-error" role="alert">
                {error}
            </div>
        )}

        {success && (
            <div className="product-success" role="status">
                {success}
            </div>
        )}

        <form className="product-form" onSubmit={handleSubmit}>
            <div className="product-form-section">
                <h3>Basic Information</h3>
                <p>
                    Enter the product's name and botanical details.
                </p>

                <div className="product-form-grid">
                    <label>
                        Product Name <span>*</span>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Botanical Wellness Blend"
                            maxLength={150}
                            required
                        />
                    </label>

                    <label>
                        Botanical Name
                        <input
                            type="text"
                            name="botanicalName"
                            value={form.botanicalName}
                            onChange={handleChange}
                            placeholder="Scientific or botanical name"
                            maxLength={200}
                        />
                    </label>

                    <label className="product-form-full">
                        Category <span>*</span>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            disabled={loadingCategories}
                            required
                        >
                            <option value="">
                                {loadingCategories
                                    ? "Loading categories..."
                                    : "Select a category"}
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category._id}
                                    value={category._id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {!loadingCategories &&
                            categories.length === 0 && (
                                <small>
                                    No categories are available.
                                    Create a category before adding
                                    a product.
                                </small>
                            )}
                    </label>
                </div>
            </div>

            <div className="product-form-section">
                <h3>Product Images</h3>
                <p>
                    Add up to five clear product photos. JPG, PNG,
                    and WebP images are supported, with a maximum
                    size of 5 MB per image.
                </p>

                <label className="product-image-picker">
                    <span className="product-image-picker-icon">
                        ＋
                    </span>
                    <strong>
                        Choose Product Images
                    </strong>
                    <small>
                        {selectedImages.length} of {MAX_IMAGES} images
                        selected
                    </small>

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageChange}
                        disabled={
                            saving ||
                            selectedImages.length >= MAX_IMAGES
                        }
                    />
                </label>

                {selectedImages.length > 0 && (
                    <div className="product-image-preview-grid">
                        {selectedImages.map((image, index) => (
                            <div
                                className="product-image-preview"
                                key={`${image.file.name}-${image.file.lastModified}-${index}`}
                            >
                                <img
                                    src={image.preview}
                                    alt={`Product preview ${index + 1}`}
                                />

                                <div className="product-image-preview-info">
                                    <span title={image.file.name}>
                                        {image.file.name}
                                    </span>

                                    <small>
                                        {(
                                            image.file.size /
                                            (1024 * 1024)
                                        ).toFixed(2)}{" "}
                                        MB
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    className="product-image-remove"
                                    onClick={() => removeImage(index)}
                                    disabled={saving}
                                    aria-label={`Remove ${image.file.name}`}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <small className="product-image-note">
                    Images upload to Cloudinary when you save the
                    product. Your product details are saved separately
                    in the SAB database.
                </small>
            </div>

            <div className="product-form-section">
                <h3>Product Description</h3>
                <p>
                    Describe the product for your catalogue visitors.
                </p>

                <div className="product-form-grid">
                    <label className="product-form-full">
                        Short Description <span>*</span>
                        <textarea
                            name="shortDescription"
                            value={form.shortDescription}
                            onChange={handleChange}
                            placeholder="A brief summary of the product"
                            maxLength={300}
                            rows={3}
                            required
                        />
                        <small>
                            {form.shortDescription.length}/300
                            characters
                        </small>
                    </label>

                    <label className="product-form-full">
                        Full Description <span>*</span>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Provide the full product description"
                            rows={6}
                            required
                        />
                    </label>
                </div>
            </div>

            <div className="product-form-section">
                <h3>Product Details</h3>
                <p>
                    List the ingredients, benefits, and usage
                    information.
                </p>

                <div className="product-form-grid">
                    <label>
                        Benefits
                        <textarea
                            name="benefits"
                            value={form.benefits}
                            onChange={handleChange}
                            placeholder="Enter one benefit per line"
                            rows={4}
                        />
                        <small>
                            You can also separate items with commas.
                        </small>
                    </label>

                    <label>
                        Ingredients
                        <textarea
                            name="ingredients"
                            value={form.ingredients}
                            onChange={handleChange}
                            placeholder="Enter one ingredient per line"
                            rows={4}
                        />
                        <small>
                            You can also separate items with commas.
                        </small>
                    </label>

                    <label className="product-form-full">
                        Usage Instructions
                        <textarea
                            name="usageInstructions"
                            value={form.usageInstructions}
                            onChange={handleChange}
                            placeholder="Enter the product's usage instructions"
                            rows={4}
                        />
                    </label>
                </div>
            </div>

            <div className="product-form-section">
                <h3>Publishing</h3>
                <p>
                    Choose how the product should appear in your
                    catalogue.
                </p>

                <div className="product-form-grid">
                    <label>
                        Publication Status
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">
                                Published
                            </option>
                            <option value="archived">
                                Archived
                            </option>
                        </select>
                    </label>

                    <label className="product-featured-option">
                        <input
                            type="checkbox"
                            name="isFeatured"
                            checked={form.isFeatured}
                            onChange={handleChange}
                        />
                        <span>
                            <strong>Featured Product</strong>
                            <small>
                                Mark this product as featured.
                            </small>
                        </span>
                    </label>
                </div>
            </div>

            <div className="product-form-actions">
                <Link
                    className="secondary-button"
                    to="/admin/products"
                >
                    Cancel
                </Link>

                <button
                    type="submit"
                    className="primary-button"
                    disabled={
                        saving ||
                        loadingCategories ||
                        categories.length === 0
                    }
                >
                    {saving
                        ? "Uploading / Saving..."
                        : "Save Product"}
                </button>
            </div>
        </form>
    </section>
);


}
