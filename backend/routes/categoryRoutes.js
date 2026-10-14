import express from "express";
import {
createCategory,
getCategories,
getCategoryById,
updateCategory,
deleteCategory,
} from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);

// Protected administrator route: retrieve all categories
router.get("/admin/all", protect, getCategories);

// Public category details
router.get("/:id", getCategoryById);

// Protected administrator routes
router.post("/", protect, createCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
