import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

const uploadToCloudinary = (file, folder) => {
return new Promise((resolve, reject) => {
const uploadStream = cloudinary.uploader.upload_stream(
{
folder,
resource_type: "image",
allowed_formats: ["jpg", "jpeg", "png", "webp"],
},
(error, result) => {
if (error) {
return reject(error);
}


            resolve({
                url: result.secure_url,
                publicId: result.public_id,
                alt: file.originalname,
            });
        }
    );

    Readable.from(file.buffer).pipe(uploadStream);
});


};

export const uploadProductImages = async (req, res) => {
try {
if (!req.files || req.files.length === 0) {
return res.status(400).json({
success: false,
message: "Please select at least one image to upload.",
});
}


    const uploadedImages = await Promise.all(
        req.files.map((file) =>
            uploadToCloudinary(file, "sab/products")
        )
    );

    return res.status(200).json({
        success: true,
        message: "Product images uploaded successfully.",
        data: uploadedImages,
    });
} catch (error) {
    console.error("Product image upload error:", error);

    return res.status(500).json({
        success: false,
        message: "Image upload failed. Please try again.",
    });
}


};

export const uploadArticleImage = async (req, res) => {
try {
if (!req.file) {
return res.status(400).json({
success: false,
message: "Please select an article cover image.",
});
}


    const uploadedImage = await uploadToCloudinary(
        req.file,
        "sab/articles"
    );

    return res.status(200).json({
        success: true,
        message: "Article cover image uploaded successfully.",
        data: uploadedImage,
    });
} catch (error) {
    console.error("Article image upload error:", error);

    return res.status(500).json({
        success: false,
        message: "Article image upload failed. Please try again.",
    });
}


};
