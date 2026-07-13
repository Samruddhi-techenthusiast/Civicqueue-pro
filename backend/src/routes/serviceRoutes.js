const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

/* ============================================
   GET ALL SERVICES (PUBLIC - for citizens)
============================================ */
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================
   CREATE SERVICE (ADMIN ONLY)
============================================ */
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
