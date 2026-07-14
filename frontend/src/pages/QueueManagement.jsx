import { useState } from "react";

const QueueManagement = () => {
  const [selectedService, setSelectedService] = useState("Passport Service");

  const queueData = [
    {
      id: 1,
      ticket: "Q-101",
      name: "Rahul Sharma",
      status: "Serving",
      time: "10:02 AM",
    },
    {
      id: 2,
      ticket: "Q-102",
      name: "Anita Verma",
      status: "Waiting",
      time: "10:05 AM",
    },
    {
      id: 3,
      ticket: "Q-103",
      name: "Suresh Patel",
      status: "Waiting",
      time: "10:08 AM",
    },
  ];

  return (
    <div style={{ padding: "30px" }}>
      <h2>Queue Management</h2>

      {/* Service Selector */}
      <div style={{ marginBottom: "20px" }}>
        <label>Select Department: </label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          style={{ padding: "8px", marginLeft: "10px" }}
        >
          <option>Passport Service</option>
          <option>Driving License</option>
          <option>Municipal Services</option>
          <option>Property Registration</option>
        </select>
      </div>

      {/* Live Status */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
          marginBottom: "20px",
        }}
      >
        <h3>Currently Serving: Q-101</h3>
        <p>Citizens Waiting: 2</p>
        <p>Average Wait Time: 12 Minutes</p>

        <button style={btnStyle}>Call Next Citizen</button>
        <button style={btnStyle}>Skip Current</button>
        <button style={btnStyle}>Pause Queue</button>
        <button style={{ ...btnStyle, background: "#dc2626" }}>
          Reset Queue
        </button>
      </div>

      {/* Queue Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
        }}
      >
        <thead style={{ background: "#1e3a8a", color: "white" }}>
          <tr>
            <th style={thStyle}>Queue Ticket</th>
            <th style={thStyle}>Citizen Name</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Time Issued</th>
          </tr>
        </thead>
        <tbody>
          {queueData.map((item) => (
            <tr key={item.id}>
              <td style={tdStyle}>{item.ticket}</td>
              <td style={tdStyle}>{item.name}</td>
              <td style={tdStyle}>{item.status}</td>
              <td style={tdStyle}>{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const btnStyle = {
  padding: "10px 15px",
  margin: "10px 10px 0 0",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};

export default QueueManagement;
