import express from "express";
import {
getCompanyInfo,
updateCompanyInfo,
} from "../controllers/companyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCompanyInfo);
router.put("/", protect, updateCompanyInfo);

export default router;