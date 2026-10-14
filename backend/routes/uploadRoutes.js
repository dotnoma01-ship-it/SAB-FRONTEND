import express from "express";
import multer from "multer";
import {
uploadProductImages,
uploadArticleImage,
} from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
storage: multer.memoryStorage(),
limits: {
fileSize: 5 * 1024 * 1024,
files: 5,
},
fileFilter: (req, file, callback) => {
const allowedTypes = [
"image/jpeg",
"image/png",
"image/webp",
];


    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(
            new Error("Only JPG, PNG, and WebP images are allowed.")
        );
    }
},


});

router.post(
"/products",
protect,
upload.array("images", 5),
uploadProductImages
);

router.post(
"/articles",
protect,
upload.single("image"),
uploadArticleImage
);

export default router;
