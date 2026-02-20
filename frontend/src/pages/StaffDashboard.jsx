import { useEffect } from "react";
import { getSocket } from "../socket";

const StaffDashboard = () => {
  const serviceId = "697b4d76e8dbe1798eda2e53";

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    console.log("🧑‍💼 Staff joined service");

    socket.emit("joinService", serviceId);

    socket.on("tokenUpdated", (data) => {
      console.log("🔔 Staff received update:", data);
    });

    return () => {
      socket.off("tokenUpdated");
    };
  }, [serviceId]);

  return (
    <div>
      <h2>Staff Dashboard</h2>
    </div>
  );
};

export default StaffDashboard;
