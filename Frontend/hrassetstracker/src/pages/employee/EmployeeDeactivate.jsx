import { useState } from "react";
import { toast } from "react-hot-toast";

const EmployeeDeactivate = ({ employee, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Reason cannot be empty.");
      return;
    }
    if (reason.startsWith(" ")) {
      setError("Reason cannot start with a space.");
      return;
    }

    setError("");
    await onSubmit(employee.employee_id, reason);
    onClose();
  };

  // Prevent clicks inside modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    // Prevent starting with space
    if (value.length === 1 && value === " ") return;
    setReason(value);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        onClick={handleModalClick}
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "20px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <span style={{ fontWeight: "500", color: "black" }}>
          Employee Name: {employee.fullname}
        </span>

        <small className="d-block mt-3 text-muted">Reason:</small>
        <textarea
          className="form-control mt-1"
          rows="4"
          placeholder="Enter reason for deactivation"
          value={reason}
          onChange={handleReasonChange}
          style={{ resize: "none" }}
        />
        {error && <small className="text-danger">{error}</small>}

        <div className="mt-3 d-flex justify-content-end gap-2">
          <button className="btn btn-outline-dark" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-dark" onClick={handleSubmit}>
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDeactivate;
