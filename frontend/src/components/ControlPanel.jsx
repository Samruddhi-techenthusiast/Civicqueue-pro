const ControlPanel = ({ onNext }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={onNext}
        style={{
          padding: "12px 25px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        ➡ Call Next Citizen
      </button>
    </div>
  );
};

export default ControlPanel;
