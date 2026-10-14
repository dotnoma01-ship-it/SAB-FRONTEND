import dns from "node:dns";
import mongoose from "mongoose";

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error(
            "MONGO_URI is missing. Check your backend/.env file."
        );
    }

    try {
        // Configure DNS before attempting the MongoDB connection.
        dns.setServers(["1.1.1.1", "8.8.8.8"]);

        console.log("DNS servers:", dns.getServers());
        console.log("Connecting to MongoDB...");

        const connection = await mongoose.connect(
            process.env.MONGO_URI,
            {
                serverSelectionTimeoutMS: 15000,
            }
        );

        console.log(
            `MongoDB connected successfully: ${connection.connection.host}`
        );
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

export default connectDB;