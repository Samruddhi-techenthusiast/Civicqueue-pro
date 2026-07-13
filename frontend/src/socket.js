import { io } from "socket.io-client";
import toast from "react-hot-toast"; // Make sure react-hot-toast is installed

let socket = null;

// 🔌 Connect socket
export const connectSocket = (authToken) => {
  if (!authToken) return;

  socket = io("http://localhost:5001", {
    auth: { token: authToken },
    transports: ["websocket"], // Force websocket transport
  });

  // Notify when a token starts serving (for citizen)
  socket.on("tokenUpdated", (data) => {
    if (data?.status === "serving") {
      toast.success(`Token T-${data.tokenNumber} is now serving!`);
    }
  });

  // Notify when a new token is booked (for admin)
  socket.on("newToken", (data) => {
    // data = { serviceId, serviceName, tokenNumber, citizenName }
    toast.success(
      `New token booked for ${data.serviceName} by ${data.citizenName} (Token: ${data.tokenNumber})`
    );
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("🔌 Socket connection error:", err.message);
  });

  return socket;
};

// 📦 Get existing socket instance
export const getSocket = () => socket;

// Utility default export
export default {
  emit: (...args) => socket?.emit(...args),
  on: (...args) => socket?.on(...args),
  off: (...args) => socket?.off(...args),
  disconnect: () => socket?.disconnect(),
};
