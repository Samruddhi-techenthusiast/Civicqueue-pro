const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tokenNumber: Number,
    status: {
      type: String,
      enum: ["waiting", "serving", "completed"],
      default: "waiting",
    },
    citizenName: { type: String, required: true },
    phone: { type: String, required: true },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Token", tokenSchema);
