import { useEffect, useState } from "react";
import { connectSocket } from "../socket";
import axios from "axios";
import toast from "react-hot-toast";

const CitizenDashboard = () => {
  const [services, setServices] = useState([]);
  const [queues, setQueues] = useState({});
  const [stats, setStats] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({ citizenName: "", phone: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [myUserId] = useState(localStorage.getItem("userId"));
  const token = localStorage.getItem("token");

  let socket;

  // -----------------------------
  // Fetch services on mount
  // -----------------------------
  useEffect(() => {
    if (!token) return (window.location.href = "/");
    fetchServices();
  }, []);

  // -----------------------------
  // Connect Socket.IO
  // -----------------------------
  useEffect(() => {
    if (!services.length) return;

    socket = connectSocket(token);

    socket.on("connect", () => {
      services.forEach((s) => socket.emit("joinService", s._id));
    });

    socket.on("tokenUpdated", (update) => {
      if (update.serviceId) fetchQueue(update.serviceId);
      fetchMyTokens();
      if (update.action === "TOKEN_CALLED") {
        toast.success(`Now serving Token ${update.tokenNumber}`);
      }
    });

    return () => socket.disconnect();
  }, [services]);

  // -----------------------------
  // Fetch all services
  // -----------------------------
  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data);
      res.data.forEach((s) => fetchQueue(s._id));
    } catch (err) {
      console.error("Failed to load services:", err);
      toast.error("Failed to load services");
    }
  };

  // -----------------------------
  // Fetch queue for a specific service
  // -----------------------------
  const fetchQueue = async (serviceId) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/tokens/queue/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
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
      console.error("Queue fetch error:", err);
      toast.error("Failed to fetch queue");
    }
  };

  // -----------------------------
  // Fetch my tokens
  // -----------------------------
  const fetchMyTokens = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/tokens/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myTokens = res.data;
      setQueues((prev) => {
        const updated = { ...prev };
        myTokens.forEach((t) => {
          if (!updated[t.service?._id]) updated[t.service?._id] = [];
          if (!updated[t.service?._id].find((q) => q._id === t._id)) updated[t.service?._id].push(t);
        });
        return updated;
      });
    } catch {
      toast.error("Failed to load your tokens");
    }
  };

  // -----------------------------
  // Book token
  // -----------------------------
  const bookToken = async () => {
    // --- FRONTEND VALIDATION ---
    if (!formData.citizenName.trim() || !formData.phone.trim()) {
      return toast.error("Please enter your name and phone number");
    }
    if (!selectedService) {
      return toast.error("Please select a service");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5001/api/tokens/generate",
        {
          serviceId: selectedService,
          citizenName: formData.citizenName.trim(),
          phone: formData.phone.trim(),
          notes: formData.notes.trim() || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Token ${res.data.tokenNumber} booked successfully 🎉`);
      setFormData({ citizenName: "", phone: "", notes: "" });
      setSelectedService(null);

      fetchQueue(selectedService);
      fetchMyTokens();

      // emit socket so admin sees new token
      socket.emit("newToken", {
        serviceId: res.data.service,
        serviceName: res.data.service.name || "Service",
        tokenNumber: res.data.tokenNumber,
        citizenName: res.data.citizenName,
      });
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // JSX
  // -----------------------------
  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <h2>CivicQueue</h2>
        <div style={styles.menuItem}>Dashboard</div>
        <div style={styles.menuItem}>Services</div>
        <div style={styles.menuItem}>My Tokens</div>
      </div>

      <div style={styles.main}>
        <h1>Citizen Dashboard</h1>

        {services.map((service) => (
          <div key={service._id} style={{ marginBottom: "50px" }}>
            <h2>{service.name}</h2>

            <div style={styles.statsGrid}>
              <StatCard title="Now Serving" value={stats[service._id]?.serving || "None"} />
              <StatCard title="Waiting" value={stats[service._id]?.waiting || 0} />
              <StatCard title="Completed" value={stats[service._id]?.completed || 0} />
              <StatCard title="Total Issued" value={stats[service._id]?.total || 0} />
            </div>

            <button
              style={styles.primaryButton}
              onClick={() => setSelectedService(service._id)}
            >
              Book Token
            </button>

            <div style={styles.tableCard}>
              <h3>Live Queue</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Queue No</th>
                    <th>Status</th>
                    <th>Issued Time</th>
                  </tr>
                </thead>
                <tbody>
                  {queues[service._id]?.map((item) => (
                    <tr
                      key={item._id}
                      style={{ background: item.user === myUserId ? "#dbeafe" : "white" }}
                    >
                      <td>{item.tokenNumber}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>{new Date(item.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* ---------------- MODAL ---------------- */}
        {selectedService && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <h2 style={{ textAlign: "center" }}>Enter Your Details</h2>

              <input
                type="text"
                placeholder="Full Name"
                style={styles.modalInput}
                value={formData.citizenName}
                onChange={(e) =>
                  setFormData({ ...formData, citizenName: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Phone Number"
                style={styles.modalInput}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <textarea
                placeholder="Notes (optional)"
                style={styles.modalInput}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  style={{ ...styles.primaryButton, background: "#ccc", color: "#000" }}
                  onClick={() => setSelectedService(null)}
                >
                  Cancel
                </button>

                <button
                  style={styles.primaryButton}
                  onClick={bookToken}
                  disabled={loading}
                >
                  {loading ? "Booking..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
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

const StatusBadge = ({ status }) => {
  const colors = { waiting: "#f59e0b", serving: "#2563eb", completed: "#16a34a" };
  return (
    <span
      style={{
        background: colors[status] || "#64748b",
        color: "white",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
      }}
    >
      {status}
    </span>
  );
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
  tableCard: { background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "15px" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalCard: { background: "white", padding: "30px", borderRadius: "16px", width: "400px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "10px" },
  modalInput: { width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "14px" },
};

export default CitizenDashboard;
