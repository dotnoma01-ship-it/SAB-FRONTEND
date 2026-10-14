
import jwt from "jsonwebtoken";

const generateToken = (adminId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing from the environment.");
    }

    return jwt.sign(
        { adminId: adminId.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
    );
};

export default generateToken;
