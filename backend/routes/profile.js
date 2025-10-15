
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import upload from "../config/cloudinaryConfig.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Get profile
router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ profile: user.profile, email: user.email, role: user.role });
});


// Upload avatar image
router.post("/upload-avatar", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.path) return res.status(400).json({ error: "No image uploaded" });
    // Save avatar URL to user profile
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { "profile.avatarUrl": req.file.path },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ url: req.file.path });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// Update profile fields
router.post("/update", authMiddleware, async (req, res) => {
  const { username, dob, address, bloodGroup, avatarUrl } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.profile.name = username;
    user.profile.dob = dob;
    user.profile.address = address;
    user.profile.bloodGroup = bloodGroup;
    if (avatarUrl) user.profile.avatarUrl = avatarUrl;
    await user.save();
    res.json({ profile: user.profile });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;
