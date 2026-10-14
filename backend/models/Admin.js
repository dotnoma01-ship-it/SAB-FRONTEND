import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Administrator name is required."],
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: [true, "Administrator email is required."],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address.",
            ],
        },

        password: {
            type: String,
            required: [true, "Password is required."],
            minlength: [12, "Password must contain at least 12 characters."],
            select: false,
        },

        role: {
            type: String,
            enum: ["admin", "superadmin"],
            default: "admin",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Hash the password whenever it is created or changed.
adminSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;