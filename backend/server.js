const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");


// Load environment variables
dotenv.config();

// Express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // adjust to your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(cors());

// ====================
// MongoDB Connection
// ====================
mongoose
  .connect(process.env.MONGO_URI) // fixed connection
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ====================
// Routes
// ====================
const serviceRoutes = require("./src/routes/serviceRoutes");
const tokenRoutes = require("./src/routes/tokenRoutes");
const authRoutes = require("./src/routes/authRoutes");


app.use("/api/services", serviceRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/auth", authRoutes);

// ====================
// Socket.IO Logic
// ====================
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinService", (serviceId) => {
    socket.join(serviceId);
    console.log(`Socket ${socket.id} joined service room: ${serviceId}`);
  });

  socket.on("newToken", (tokenData) => {
    io.to(tokenData.serviceId).emit("tokenUpdated", {
      action: "TOKEN_NEW",
      ...tokenData,
    });
  });

  socket.on("nextToken", ({ serviceId }) => {
    io.to(serviceId).emit("tokenUpdated", { action: "TOKEN_CALLED" });
  });

  socket.on("completeToken", ({ tokenId }) => {
    io.emit("tokenUpdated", { action: "TOKEN_COMPLETED", tokenId });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ====================
// Start Server
// ====================
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
