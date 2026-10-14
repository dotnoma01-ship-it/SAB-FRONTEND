import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
{
title: {
type: String,
required: [true, "Article title is required."],
trim: true,
maxlength: 200,
},


    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    summary: {
        type: String,
        required: [true, "Article summary is required."],
        trim: true,
        maxlength: 500,
    },

    content: {
        type: String,
        required: [true, "Article content is required."],
        trim: true,
    },

    coverImage: {
        url: {
            type: String,
            default: "",
            trim: true,
        },

        publicId: {
            type: String,
            default: "",
            trim: true,
        },

        alt: {
            type: String,
            default: "",
            trim: true,
            maxlength: 200,
        },
    },

    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null,
    },
},
{
    timestamps: true,
}


);

articleSchema.index({ status: 1, createdAt: -1 });

const Article = mongoose.model("Article", articleSchema);

export default Article;
