import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const protect = async (req, res, next) => {
    try {
        let token;

        // Read the token from the Authorization header.
        const authorization = req.headers.authorization;

        if (
            authorization &&
            authorization.startsWith("Bearer ")
        ) {
            token = authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Authentication is not configured on the server.",
            });
        }

        // Verify the token's signature and expiration.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.adminId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
        }

        // Confirm that the administrator still exists and is active.
        const admin = await Admin.findById(decoded.adminId).select(
            "-password"
        );

        if (!admin || admin.isActive === false) {
            return res.status(401).json({
                success: false,
                message: "Your administrator account is unavailable.",
            });
        }

        // Make the authenticated administrator available to controllers.
        req.admin = admin;

        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Your session is invalid or has expired. Please log in again.",
            });
        }

        next(error);
    }
};

export { protect };