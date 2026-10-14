import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required."],
            trim: true,
            maxlength: 150,
        },

        botanicalName: {
            type: String,
            trim: true,
            maxlength: 200,
            default: "",
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Product category is required."],
        },

        shortDescription: {
            type: String,
            required: [true, "A short description is required."],
            trim: true,
            maxlength: 300,
        },

        description: {
            type: String,
            required: [true, "Product description is required."],
            trim: true,
        },

        benefits: [
            {
                type: String,
                trim: true,
            },
        ],

        ingredients: [
            {
                type: String,
                trim: true,
            },
        ],

        usageInstructions: {
            type: String,
            trim: true,
            default: "",
        },

        images: [
            {
                url: {
                    type: String,
                    required: true,
                },

                publicId: {
                    type: String,
                    default: "",
                },

                alt: {
                    type: String,
                    default: "",
                },
            },
        ],

        isFeatured: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;