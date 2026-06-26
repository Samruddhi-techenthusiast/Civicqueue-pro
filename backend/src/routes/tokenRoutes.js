const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Token = require("../models/Token");
const Service = require("../models/Service");
const { protect } = require("../middleware/authMiddleware");

// ================================
// Generate / Book Token
// ================================
router.post("/generate", protect, async (req, res) => {
  try {
    const { serviceId, citizenName, phone, notes } = req.body;

    // -------------------------
    // Validation
    // -------------------------
    if (!serviceId || !citizenName || !phone) {
      return res.status(400).json({
        message: "Service, Citizen Name, and Phone are required",
      });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // -------------------------
    // Generate next token number
    // -------------------------
    const lastToken = await Token.find({ service: serviceId })
      .sort({ tokenNumber: -1 })
      .limit(1);

    const nextNumber = lastToken.length ? lastToken[0].tokenNumber + 1 : 1;

    // -------------------------
    // Create token
    // -------------------------
    const token = new Token({
      service: serviceId,
      user: req.user._id,
      tokenNumber: nextNumber,
      citizenName,
      phone,
      notes: notes || "",
    });

    await token.save();

    // -------------------------
    // Emit to socket
    // -------------------------
    const io = req.app.get("io");
    if (io) {
      io.to(`service_${serviceId}`).emit("tokenUpdated", {
        action: "TOKEN_BOOKED",
        serviceId,
        tokenId: token._id,
        tokenNumber: token.tokenNumber,
        status: token.status,
        citizenName: token.citizenName,
        userId: req.user._id,
      });
    }

    return res.status(201).json(token);
  } catch (err) {
    console.error("Token generation error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ================================
// Get Queue for a Service
// ================================
router.get("/queue/:serviceId", protect, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const tokens = await Token.find({ service: serviceId })
      .populate("user", "name email")
      .sort({ tokenNumber: 1 });
    res.json(tokens);
  } catch (err) {
    console.error("Queue fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================================
// Get My Tokens
// ================================
router.get("/my", protect, async (req, res) => {
  try {
    const myTokens = await Token.find({ user: req.user._id })
      .populate("service", "name")
      .sort({ createdAt: -1 });
    res.json(myTokens);
  } catch (err) {
    console.error("My tokens fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
