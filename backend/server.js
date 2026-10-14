import "dotenv/config";

import dns from "node:dns";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";


// Work around the default DNS resolver issue during development.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
cors({
origin: [
process.env.CLIENT_URL,
"http://localhost:5173",
"http://localhost:5177",
"http://localhost:5178",
"http://localhost:5179",
].filter(Boolean),
})
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(
"/api",
rateLimit({
windowMs: 15 * 60 * 1000,
limit: 300,
standardHeaders: "draft-8",
legacyHeaders: false,
message: {
success: false,
message: "Too many requests. Please try again later.",
},
})
);

app.get("/", (req, res) => {
res.json({
success: true,
message: "SOUGHT AFTER BOTACEUTICAL API",
version: "1.0.0",
});
});

app.get("/api/health", (req, res) => {
res.status(200).json({
success: true,
message: "Backend is running.",
database:
process.env.MONGO_URI && process.env.MONGO_URI.trim()
? "Configured"
: "Not configured",
timestamp: new Date().toISOString(),
});
});

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/company", companyRoutes);


app.use((req, res) => {
res.status(404).json({
success: false,
message: `Route not found: ${req.method} ${req.originalUrl}`,
});
});

app.use((err, req, res, next) => {
console.error(err);


if (res.headersSent) {
    return next(err);
}

res.status(err.status || 500).json({
    success: false,
    message:
        process.env.NODE_ENV === "production"
            ? "An unexpected server error occurred."
            : err.message || "Internal server error.",
});


});

const PORT = process.env.PORT || 5002;

const startServer = async () => {
try {
await connectDB();


    app.listen(PORT, () => {
        console.log(
            `SOUGHT AFTER BOTACEUTICAL API running at http://localhost:${PORT}`
        );
    });
} catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
}


};

startServer();
