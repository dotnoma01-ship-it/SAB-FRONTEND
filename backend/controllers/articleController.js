import Article from "../models/Article.js";

const createSlug = (text) =>
text
.toLowerCase()
.trim()
.replace(/[^a-z0-9]+/g, "-")
.replace(/^-+|-+$/g, "");

const createArticle = async (req, res, next) => {
try {
const { title, summary, content, coverImage, status } = req.body;


    if (!title?.trim() || !summary?.trim() || !content?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Title, summary, and content are required.",
        });
    }

    const baseSlug = createSlug(title);

    if (!baseSlug) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid article title.",
        });
    }

    let slug = baseSlug;
    let counter = 1;

    while (await Article.exists({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }

    const article = await Article.create({
        title: title.trim(),
        slug,
        summary: summary.trim(),
        content: content.trim(),
        coverImage: coverImage || {},
        status: ["draft", "published"].includes(status) ? status : "draft",
        author: req.admin?._id || null,
    });

    return res.status(201).json({
        success: true,
        message: "Article created successfully.",
        data: article,
    });
} catch (error) {
    next(error);
}


};

const getArticles = async (req, res, next) => {
try {
const filter = {};


    if (!(req.query.all === "true" && req.admin)) {
        filter.status = "published";
    }

    const articles = await Article.find(filter)
        .populate("author", "name email")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        count: articles.length,
        data: articles,
    });
} catch (error) {
    next(error);
}


};

const getArticleBySlug = async (req, res, next) => {
try {
const filter = { slug: req.params.slug };


    if (!req.admin) {
        filter.status = "published";
    }

    const article = await Article.findOne(filter)
        .populate("author", "name email");

    if (!article) {
        return res.status(404).json({
            success: false,
            message: "Article not found.",
        });
    }

    return res.status(200).json({
        success: true,
        data: article,
    });
} catch (error) {
    next(error);
}


};

const updateArticle = async (req, res, next) => {
try {
const article = await Article.findById(req.params.id);


    if (!article) {
        return res.status(404).json({
            success: false,
            message: "Article not found.",
        });
    }

    const { title, summary, content, coverImage, status } = req.body;

    if (title !== undefined) {
        if (!title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Article title cannot be empty.",
            });
        }

        article.title = title.trim();

        const baseSlug = createSlug(title);
        let slug = baseSlug;
        let counter = 1;

        while (
            await Article.exists({
                slug,
                _id: { $ne: article._id },
            })
        ) {
            slug = `${baseSlug}-${counter}`;
            counter += 1;
        }

        article.slug = slug;
    }

    if (summary !== undefined) {
        if (!summary.trim()) {
            return res.status(400).json({
                success: false,
                message: "Article summary cannot be empty.",
            });
        }

        article.summary = summary.trim();
    }

    if (content !== undefined) {
        if (!content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Article content cannot be empty.",
            });
        }

        article.content = content.trim();
    }

    if (coverImage !== undefined) {
        article.coverImage = coverImage;
    }

    if (status !== undefined) {
        if (!["draft", "published"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be draft or published.",
            });
        }

        article.status = status;
    }

    await article.save();

    return res.status(200).json({
        success: true,
        message: "Article updated successfully.",
        data: article,
    });
} catch (error) {
    next(error);
}


};

const deleteArticle = async (req, res, next) => {
try {
const article = await Article.findByIdAndDelete(req.params.id);


    if (!article) {
        return res.status(404).json({
            success: false,
            message: "Article not found.",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Article deleted successfully.",
    });
} catch (error) {
    next(error);
}


};

export {
createArticle,
getArticles,
getArticleBySlug,
updateArticle,
deleteArticle,
};
