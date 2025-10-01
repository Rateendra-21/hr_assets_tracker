import React, { useState } from "react";

const DeclineAssetPopup = ({ show, onClose, onSubmit, asset }) => {
  const [remarks, setRemarks] = useState("");

  if (!show) return null;

  const handleSubmit = () => {
    if (!remarks.trim()) {
      alert("Please enter remarks for decline.");
      return;
    }
    onSubmit(remarks);
    setRemarks(""); // Clear for next time
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
    onClick={(e) => e.stopPropagation()}
    style={{
      backgroundColor: "#fff",
      borderRadius: "8px",
      padding: "20px",
      width: "100%",
      maxWidth: "500px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }}
  >
    <h5 style={{ fontWeight: "500", color: "black" }}>Decline Asset</h5>

    {asset && (
      <div className="mt-2 mb-3" style={{ fontWeight: "500" }}>
        <span className="d-block">
          Asset Name: {asset.asset_name || "-"}
        </span>
        <span className="d-block">
          Category: {asset.category || "-"}
        </span>
        <span className="d-block">
          Manufacturer: {asset.manufacturer || "-"}
        </span>
      </div>
    )}

    <small className="d-block mt-2 text-muted">Reason for Decline:</small>
    <textarea
      className="form-control mt-1"
      rows="4"
      placeholder="Enter reason for declining the assigned asset"
      value={remarks}
      onChange={(e) => setRemarks(e.target.value)}
      style={{ resize: "none" }}
    />

    <div className="d-flex justify-content-end gap-2 mt-3">
      <button className="btn btn-outline-dark" onClick={onClose}>
        Cancel
      </button>
      <button
        className="btn btn-danger"
        onClick={handleSubmit}
        disabled={!remarks.trim()}
      >
        Decline
      </button>
    </div>
  </div>
</div>

  );
};

export default DeclineAssetPopup;



