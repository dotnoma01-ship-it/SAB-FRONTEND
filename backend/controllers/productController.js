import Product from "../models/Product.js";
import Category from "../models/Category.js";

// Validate product images before saving them.
const validateProductImages = (images) => {
if (images === undefined) {
return { valid: true, images: [] };
}


if (!Array.isArray(images)) {
    return {
        valid: false,
        message: "Product images must be provided as an array.",
    };
}

if (images.length > 5) {
    return {
        valid: false,
        message: "A product can have a maximum of 5 images.",
    };
}

const validImages = [];

for (const image of images) {
    if (
        !image ||
        typeof image.url !== "string" ||
        !image.url.startsWith("https://") ||
        typeof image.publicId !== "string" ||
        !image.publicId.trim()
    ) {
        return {
            valid: false,
            message:
                "Each image must have a valid HTTPS URL and Cloudinary public ID.",
        };
    }

    validImages.push({
        url: image.url,
        publicId: image.publicId.trim(),
        alt:
            typeof image.alt === "string"
                ? image.alt.trim().slice(0, 200)
                : "",
    });
}

return {
    valid: true,
    images: validImages,
};

};

// Create a new product
export const createProduct = async (req, res, next) => {
try {
const {
name,
botanicalName,
category,
shortDescription,
description,
benefits,
ingredients,
usageInstructions,
images,
isFeatured,
status,
} = req.body;


    if (
        !name ||
        !category ||
        !shortDescription ||
        !description
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Name, category, short description, and description are required.",
        });
    }

    const validCategory = await Category.findById(category);

    if (!validCategory) {
        return res.status(400).json({
            success: false,
            message: "The selected category does not exist.",
        });
    }

    const imageValidation = validateProductImages(images);

    if (!imageValidation.valid) {
        return res.status(400).json({
            success: false,
            message: imageValidation.message,
        });
    }

    const slug = `${name}-${Date.now()}`
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const product = await Product.create({
        name,
        botanicalName,
        category,
        shortDescription,
        description,
        benefits,
        ingredients,
        usageInstructions,
        images: imageValidation.images,
        isFeatured,
        status,
        slug,
        createdBy: req.admin?._id || req.admin?.id || null,
    });

    const populatedProduct = await Product.findById(product._id)
        .populate("category", "name slug");

    return res.status(201).json({
        success: true,
        message: "Product created successfully.",
        data: populatedProduct,
    });
} catch (error) {
    next(error);
}


};

// Get all products
export const getProducts = async (req, res, next) => {
try {
const filter = {};


    // Public visitors see published products only.
    // Authenticated administrators can request all products.
    if (!(req.query.all === "true" && req.admin)) {
        filter.status = "published";
    }

    if (req.query.category) {
        filter.category = req.query.category;
    }

    if (req.query.featured === "true") {
        filter.isFeatured = true;
    }

    const products = await Product.find(filter)
        .populate("category", "name slug")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        count: products.length,
        data: products,
    });
} catch (error) {
    next(error);
}


};

// Get one product by its MongoDB ID
export const getProductById = async (req, res, next) => {
try {
const product = await Product.findById(req.params.id)
.populate("category", "name slug");


    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found.",
        });
    }

    if (product.status !== "published" && !req.admin) {
        return res.status(404).json({
            success: false,
            message: "Product not found.",
        });
    }

    return res.status(200).json({
        success: true,
        data: product,
    });
} catch (error) {
    next(error);
}


};

// Get one product by its slug
export const getProductBySlug = async (req, res, next) => {
try {
const product = await Product.findOne({
slug: req.params.slug,
}).populate("category", "name slug");


    if (!product || (product.status !== "published" && !req.admin)) {
        return res.status(404).json({
            success: false,
            message: "Product not found.",
        });
    }

    return res.status(200).json({
        success: true,
        data: product,
    });
} catch (error) {
    next(error);
}


};

// Update a product
export const updateProduct = async (req, res, next) => {
try {
const product = await Product.findById(req.params.id);


    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found.",
        });
    }

    // Validate images only when the request includes them.
    // Omitting images preserves the product's existing images.
    let validatedImages;

    if (req.body.images !== undefined) {
        const imageValidation = validateProductImages(req.body.images);

        if (!imageValidation.valid) {
            return res.status(400).json({
                success: false,
                message: imageValidation.message,
            });
        }

        validatedImages = imageValidation.images;
    }

    const allowedFields = [
        "name",
        "botanicalName",
        "category",
        "shortDescription",
        "description",
        "benefits",
        "ingredients",
        "usageInstructions",
        "images",
        "isFeatured",
        "status",
    ];

    for (const field of allowedFields) {
        if (field === "images") {
            if (validatedImages !== undefined) {
                product.images = validatedImages;
            }
        } else if (req.body[field] !== undefined) {
            product[field] = req.body[field];
        }
    }

    if (req.body.name !== undefined) {
        product.slug = `${req.body.name}-${Date.now()}`
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    if (req.body.category !== undefined) {
        const validCategory = await Category.findById(
            req.body.category
        );

        if (!validCategory) {
            return res.status(400).json({
                success: false,
                message: "The selected category does not exist.",
            });
        }
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id)
        .populate("category", "name slug");

    return res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        data: updatedProduct,
    });
} catch (error) {
    next(error);
}


};

// Delete a product
export const deleteProduct = async (req, res, next) => {
try {
const product = await Product.findById(req.params.id);


    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found.",
        });
    }

    await product.deleteOne();

    return res.status(200).json({
        success: true,
        message: "Product deleted successfully.",
    });
} catch (error) {
    next(error);
}


};
