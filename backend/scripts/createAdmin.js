import "dotenv/config";
import readline from "node:readline";
import dns from "node:dns";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const ask = (question) =>
    new Promise((resolve) => rl.question(question, resolve));

const askPassword = (question) =>
    new Promise((resolve) => {
        const stdin = process.stdin;
        const stdout = process.stdout;

        stdout.write(question);

        let password = "";

        const wasRaw = stdin.isRaw;

        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");

        const cleanup = () => {
            stdin.setRawMode(Boolean(wasRaw));
            stdin.pause();
            stdin.removeListener("data", onData);
            stdout.write("\n");
        };

        const onData = (character) => {
            if (character === "\u0003") {
                cleanup();
                rl.close();
                process.exit(1);
            }

            if (character === "\r" || character === "\n") {
                cleanup();
                resolve(password);
                return;
            }

            if (character === "\u007f" || character === "\b") {
                password = password.slice(0, -1);
                return;
            }

            if (character >= " ") {
                password += character;
            }
        };

        stdin.on("data", onData);
    });

const createAdmin = async () => {
    try {
        console.log("\nSOUGHT AFTER BOTACEUTICAL");
        console.log("First Administrator Setup\n");

        const name = (await ask("Administrator name: ")).trim();
        const email = (await ask("Administrator email: "))
            .trim()
            .toLowerCase();

        const password = await askPassword(
            "Administrator password (minimum 12 characters): "
        );

        if (!name || !email || !password) {
            throw new Error("All fields are required.");
        }

        if (password.length < 12) {
            throw new Error(
                "The password must contain at least 12 characters."
            );
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            throw new Error(
                "An administrator with this email already exists."
            );
        }

        await Admin.create({
            name,
            email,
            password,
            role: "superadmin",
            isActive: true,
        });

        console.log("\nAdministrator created successfully!");
        console.log(`Email: ${email}`);
        console.log("Role: superadmin");
        console.log("You can now use this account to log in.");
    } catch (error) {
        console.error("\nSetup failed:", error.message);
        process.exitCode = 1;
    } finally {
        rl.close();
        await mongoose.disconnect().catch(() => {});
    }
};

const start = async () => {
    try {
        await connectDB();
        await createAdmin();
    } catch (error) {
        console.error("Database connection failed:", error.message);
        rl.close();
        await mongoose.disconnect().catch(() => {});
        process.exitCode = 1;
    }
};

start();