import { useEffect, useState } from "react";
import { connectSocket } from "../socket";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

let socket;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [queues, setQueues] = useState({});
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchServices();
    return () => socket?.disconnect();
  }, []);

  // -----------------------------
  // Fetch all services
  // -----------------------------
  const fetchServices = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/services", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setServices(data);

      data.forEach((s) => fetchQueue(s._id));

      // Initialize socket
      if (!socket) {
        socket = connectSocket(localStorage.getItem("token"));

        socket.on("connect", () => {
          data.forEach((s) => socket.emit("joinService", s._id));
        });

        socket.on("tokenUpdated", (update) => {
          if (update.serviceId) fetchQueue(update.serviceId);

          if (update.action === "TOKEN_CALLED") {
            toast.success(`Now serving Token ${update.tokenNumber}`);
          } else if (update.action === "TOKEN_COMPLETED") {
            toast.success(`Token ${update.tokenNumber} completed`);
          } else if (update.action === "NEW_TOKEN") {
            toast.success(`New Token ${update.tokenNumber} booked`);
          } else if (update.action === "NO_WAITING") {
            toast.info("No citizens waiting");
          }
        });

        socket.on("error", (msg) => toast.error(msg));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load services");
    }
  };

  // -----------------------------
  // Fetch queue for a service
  // -----------------------------
  const fetchQueue = async (serviceId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/tokens/queue/${serviceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setQueues((prev) => ({ ...prev, [serviceId]: data }));

      const serving = data.find((q) => q.status === "serving");
      const waiting = data.filter((q) => q.status === "waiting");
      const completed = data.filter((q) => q.status === "completed");

      setStats((prev) => ({
        ...prev,
        [serviceId]: {
          serving: serving?.tokenNumber || "None",
          waiting: waiting.length,
          completed: completed.length,
          total: data.length,
        },
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch queue");
    }
  };

  // -----------------------------
  // Call next token
  // -----------------------------
  const handleNext = (serviceId) => {
    if (!socket || !socket.connected) return toast.error("Socket not connected");
    socket.emit("nextToken", { serviceId });
  };

  // -----------------------------
  // Mark token as completed
  // -----------------------------
  const handleComplete = (tokenId) => {
    if (!socket || !socket.connected) return toast.error("Socket not connected");
    socket.emit("completeToken", { tokenId });
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <h2>CivicQueue</h2>
        <div style={styles.menuItem}>Dashboard</div>
        <div style={styles.menuItem} onClick={() => navigate("/queue-management")}>
          Queue Management
        </div>
      </div>

      <div style={styles.main}>
        <h1>Admin Dashboard</h1>
        {services.map((service) => (
          <div key={service._id} style={{ marginBottom: "50px" }}>
            <h2>{service.name}</h2>

            <div style={styles.statsGrid}>
              <StatCard title="Now Serving" value={stats[service._id]?.serving || "None"} />
              <StatCard title="Waiting" value={stats[service._id]?.waiting || 0} />
              <StatCard title="Completed" value={stats[service._id]?.completed || 0} />
              <StatCard title="Total Issued" value={stats[service._id]?.total || 0} />
            </div>

            <button style={styles.primaryButton} onClick={() => handleNext(service._id)}>
              Call Next Citizen
            </button>

            <div style={styles.queueTable}>
              <h3>Queue List</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Token No</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queues[service._id]?.map((t) => (
                    <tr key={t._id}>
                      <td>{t.tokenNumber}</td>
                      <td>{t.citizenName}</td>
                      <td>
                        <span style={{ ...styles.statusBadge, background: statusColor(t.status) }}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        {t.status === "serving" && (
                          <button style={styles.completeBtn} onClick={() => handleComplete(t._id)}>
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// -----------------------------
// Components
// -----------------------------
const StatCard = ({ title, value }) => (
  <div style={styles.statCard}>
    <p style={styles.statTitle}>{title}</p>
    <h2>{value}</h2>
  </div>
);

const statusColor = (status) => {
  switch (status) {
    case "waiting":
      return "#f59e0b";
    case "serving":
      return "#2563eb";
    case "completed":
      return "#16a34a";
    default:
      return "#64748b";
  }
};

// -----------------------------
// Styles
// -----------------------------
const styles = {
  layout: { display: "flex", minHeight: "100vh", fontFamily: "Inter, sans-serif", background: "#f1f5f9" },
  sidebar: { width: "240px", background: "#0f172a", color: "white", padding: "30px 20px" },
  menuItem: { marginBottom: "20px", cursor: "pointer", opacity: 0.8 },
  main: { flex: 1, padding: "40px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" },
  statCard: { background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  statTitle: { fontSize: "14px", color: "#64748b", marginBottom: "10px" },
  primaryButton: { background: "#2563eb", color: "white", padding: "12px 25px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", marginBottom: "20px" },
  queueTable: { background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginTop: "20px" },
  table: { width: "100%", borderCollapse: "collapse" },
  statusBadge: { color: "white", padding: "5px 10px", borderRadius: "20px", fontSize: "12px" },
  completeBtn: { background: "#16a34a", color: "white", padding: "5px 12px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px" },
};

export default AdminDashboard;
