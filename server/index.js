import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from server directory first, then from root
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Wrap everything in an async IIFE to use dynamic imports
(async () => {
  // Dynamically import routes AFTER env is loaded
  const { default: authRoutes } = await import("./routes/auth.js");
  const { default: profileRoutes } = await import("./routes/profiles.js");
  const { default: parserRoutes } = await import("./routes/parser.js");

  const app = express();

  // Middleware
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(
      `[${new Date().toLocaleTimeString()}] ${req.method} ${req.path} - From: ${req.ip}`,
    );
    next();
  });

  // CORS middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // MongoDB Connection
  mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/filmsort")
    .then(() => console.log("✓ MongoDB connected"))
    .catch((err) => console.error("✗ MongoDB connection failed:", err.message));

  console.log("🔍 Environment Debug:");
  console.log("   process.env.PORT:", process.env.PORT);
  console.log("   process.env.NVIDIA_API_KEY:", process.env.NVIDIA_API_KEY ? "✓ Loaded" : "✗ Missing");
  console.log("   PORT variable will be:", process.env.PORT || 5000);

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/profiles", profileRoutes);
  app.use("/api/parser", parserRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", port: process.env.PORT || 5000 });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
})();
