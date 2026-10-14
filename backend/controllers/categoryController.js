import Category from "../models/Category.js";

const createCategory = async (req, res, next) => {
    try {
        const { name, slug, description, image, sortOrder } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: "Category name and slug are required.",
            });
        }

        const existingCategory = await Category.findOne({
            $or: [
                { name: name.trim() },
                { slug: slug.trim().toLowerCase() },
            ],
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "A category with this name or slug already exists.",
            });
        }

        const category = await Category.create({
            name: name.trim(),
            slug: slug.trim().toLowerCase(),
            description,
            image,
            sortOrder,
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const filter = {};

        if (req.query.all !== "true") {
            filter.isActive = true;
        }

        const categories = await Category.find(filter).sort({
            sortOrder: 1,
            name: 1,
        });

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const { name, slug, description, image, isActive, sortOrder } =
            req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        if (name !== undefined) category.name = name.trim();
        if (slug !== undefined) category.slug = slug.trim().toLowerCase();
        if (description !== undefined) category.description = description;
        if (image !== undefined) category.image = image;
        if (isActive !== undefined) category.isActive = isActive;
        if (sortOrder !== undefined) category.sortOrder = sortOrder;

        const duplicate = await Category.findOne({
            _id: { $ne: category._id },
            $or: [
                { name: category.name },
                { slug: category.slug },
            ],
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Another category already uses this name or slug.",
            });
        }

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }

        const Product = (await import("../models/Product.js")).default;

        const productsUsingCategory = await Product.countDocuments({
            category: category._id,
        });

        if (productsUsingCategory > 0) {
            return res.status(409).json({
                success: false,
                message:
                    "This category has products assigned to it. Reassign or remove those products before deleting the category.",
            });
        }

        await category.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};

export {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};

