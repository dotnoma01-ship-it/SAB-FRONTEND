import Admin from "../models/Admin.js";
import generateToken from "../utils/generateToken.js";

const loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const admin = await Admin.findOne({
            email: email.trim().toLowerCase(),
        }).select("+password");

        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: "This administrator account is inactive.",
            });
        }

        admin.lastLogin = new Date();
        await admin.save();

        const token = generateToken(admin._id);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                token,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

const getCurrentAdmin = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            data: {
                id: req.admin._id,
                name: req.admin.name,
                email: req.admin.email,
                role: req.admin.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

export { loginAdmin, getCurrentAdmin };
