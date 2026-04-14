import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "your-secret-key-change-in-production",
    {
      expiresIn: "7d",
    },
  );
};

// Register
router.post("/register", async (req, res) => {
  try {
    console.log("📝 Register endpoint hit");
    console.log("Request body:", req.body);

    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log("❌ Missing fields");
      return res
        .status(400)
        .json({ success: false, message: "Please provide all fields" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("❌ User already exists:", email);
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    // Create user
    console.log("✓ Creating user:", email);
    const user = await User.create({
      name,
      email,
      password,
    });
    console.log("✓ User created:", user._id);

    const token = generateToken(user._id);
    console.log("✓ Token generated");

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    // Check for user
    const user = await User.findOne({ email })
      .select("+password")
      .populate("profiles");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profiles: user.profiles,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify token is valid
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
    );

    res.status(200).json({ success: true, valid: true });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
    );
    const user = await User.findById(decoded.id).populate("profiles");

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profiles: user.profiles,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

export default router;
