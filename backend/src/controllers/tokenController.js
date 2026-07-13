const Token = require("../models/Token");
const Service = require("../models/Service");

/* ============================================
   GENERATE TOKEN (Citizen)
============================================ */
exports.generateToken = async (req, res) => {
  try {
    const { serviceId, citizenName, phone, notes } = req.body;

    if (!serviceId) return res.status(400).json({ message: "Service ID required" });
    if (!citizenName || !phone) return res.status(400).json({ message: "Name and phone required" });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const lastToken = await Token.findOne({ service: serviceId }).sort({ tokenNumber: -1 });
    const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const token = await Token.create({
      service: serviceId,
      user: req.user._id,
      tokenNumber: nextTokenNumber,
      citizenName,
      phone,
      notes,
      status: "waiting",
    });

    const io = req.app.get("io");
    const roomName = `service_${serviceId}`;

    // Notify everyone in the service room
    io.to(roomName).emit("tokenUpdated", {
      action: "TOKEN_BOOKED",
      tokenId: token._id,
      serviceId,
      tokenNumber: token.tokenNumber,
      status: token.status,
    });

    // Broadcast to all admins (or anyone connected)
    io.emit("tokenUpdated", {
      action: "TOKEN_BOOKED",
      tokenId: token._id,
      serviceId,
      tokenNumber: token.tokenNumber,
      status: token.status,
      citizenName,
    });

    res.status(201).json(token);
  } catch (err) {
    console.error("GenerateToken error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================
   GET MY TOKENS
============================================ */
exports.getMyTokens = async (req, res) => {
  try {
    const tokens = await Token.find({ user: req.user._id })
      .populate("service")
      .sort({ createdAt: -1 });
    res.json(tokens);
  } catch (err) {
    console.error("getMyTokens error:", err);
    res.status(500).json({ message: "Error fetching tokens" });
  }
};

/* ============================================
   ESTIMATE WAIT TIME (PUBLIC)
============================================ */
exports.getEstimate = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;

    const waitingCount = await Token.countDocuments({ service: serviceId, status: "waiting" });
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const estimatedTime = waitingCount * service.avgTimePerPerson;
    res.json({ waitingCount, estimatedTime: `${estimatedTime} minutes` });
  } catch (err) {
    console.error("getEstimate error:", err);
    res.status(500).json({ message: "Error estimating" });
  }
};

/* ============================================
   GET QUEUE FOR SERVICE (Admin + Citizen)
============================================ */
exports.getQueueForService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const tokens = await Token.find({ service: serviceId })
      .sort({ tokenNumber: 1 })
      .populate("user", "name email");

    res.json(tokens);
  } catch (err) {
    console.error("getQueueForService error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
