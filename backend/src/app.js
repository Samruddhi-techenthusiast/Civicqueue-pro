const express = require("express");
const cors = require("cors");

const app = express();

// 1️⃣ Apply middlewares first
app.use(
  cors({
    origin: true,            // allow all origins (DEV)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 2️⃣ Then define routes
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const tokenRoutes = require("./routes/tokenRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/tokens", tokenRoutes);

// 3️⃣ Root route
app.get("/", (req, res) => {
  res.send("CivicQueue API is running 🚦");
});

module.exports = app;
