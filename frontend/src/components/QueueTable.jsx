const QueueTable = ({ queueList }) => {
  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
      <h3>Live Queue</h3>

      <table width="100%" border="1" cellPadding="10" style={{ marginTop: "10px", borderCollapse: "collapse" }}>
        <thead style={{ background: "#343a40", color: "white" }}>
          <tr>
            <th>Queue No</th>
            <th>Status</th>
            <th>Issued At</th>
          </tr>
        </thead>
        <tbody>
          {queueList.map((q) => (
            <tr key={q._id}>
              <td>{q.tokenNumber}</td>
              <td>{q.status}</td>
              <td>{new Date(q.createdAt).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QueueTable;
