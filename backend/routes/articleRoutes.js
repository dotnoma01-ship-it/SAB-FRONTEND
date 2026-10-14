import express from "express";
import {
createArticle,
getArticles,
getArticleBySlug,
updateArticle,
deleteArticle,
} from "../controllers/articleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin: retrieve every article, including drafts.
router.get("/admin/all", protect, (req, res, next) => {
req.query.all = "true";
getArticles(req, res, next);
});

// Public: retrieve published articles only.
router.get("/", getArticles);

// Public: retrieve a published article by slug.
router.get("/slug/:slug", getArticleBySlug);

// Admin: create, update, and delete articles.
router.post("/", protect, createArticle);
router.put("/:id", protect, updateArticle);
router.delete("/:id", protect, deleteArticle);

export default router;
