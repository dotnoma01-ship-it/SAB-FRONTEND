import express from "express";
import {
createProduct,
getProducts,
getProductById,
getProductBySlug,
updateProduct,
deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);

// Protected administrator route: retrieve all products
router.get("/admin/all", protect, getProducts);

// Public product details
router.get("/:id", getProductById);

// Protected administrator routes
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
