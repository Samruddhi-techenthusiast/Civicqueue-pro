const cardStyle = {
  flex: 1,
  padding: "20px",
  borderRadius: "10px",
  color: "white",
  textAlign: "center",
};

const StatsCards = ({ stats }) => {
  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
      <div style={{ ...cardStyle, background: "#007bff" }}>
        <h3>Now Serving</h3>
        <h1>{stats.serving}</h1>
      </div>

      <div style={{ ...cardStyle, background: "#ffc107" }}>
        <h3>Waiting</h3>
        <h1>{stats.waiting}</h1>
      </div>

      <div style={{ ...cardStyle, background: "#28a745" }}>
        <h3>Completed</h3>
        <h1>{stats.completed}</h1>
      </div>

      <div style={{ ...cardStyle, background: "#6c757d" }}>
        <h3>Total Issued</h3>
        <h1>{stats.total}</h1>
      </div>
    </div>
  );
};

export default StatsCards;
