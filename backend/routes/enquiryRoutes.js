import express from "express";
import {
createEnquiry,
getEnquiries,
updateEnquiryStatus,
deleteEnquiry,
} from "../controllers/enquiryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createEnquiry);
router.get("/", protect, getEnquiries);
router.patch("/:id/status", protect, updateEnquiryStatus);
router.delete("/:id", protect, deleteEnquiry);

export default router;