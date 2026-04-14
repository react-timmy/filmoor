import express from "express";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production",
    );
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Create profile
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Profile name is required" });
    }

    const profile = await Profile.create({
      name,
      userId: req.userId,
      avatar: avatar || "avatar-1",
    });

    // Add profile to user's profiles array
    await User.findByIdAndUpdate(req.userId, {
      $push: { profiles: profile._id },
    });

    res.status(201).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's profiles
router.get("/", verifyToken, async (req, res) => {
  try {
    const profiles = await Profile.find({ userId: req.userId });
    res.status(200).json({
      success: true,
      profiles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete profile
router.delete("/:profileId", verifyToken, async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.profileId);

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    // Remove profile from user's profiles array
    await User.findByIdAndUpdate(req.userId, {
      $pull: { profiles: req.params.profileId },
    });

    res.status(200).json({
      success: true,
      message: "Profile deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
