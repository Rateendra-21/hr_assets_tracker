import { useState } from "react";
import { toast } from "react-hot-toast";

const ReturnActionPopup = ({ asset, onClose, onUpdated }) => {
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const handleModalClick = (e) => e.stopPropagation();

  const handleRemarksChange = (e) => {
    const value = e.target.value;
    if (value.length === 1 && value === " ") return;
    setRemarks(value);
  };

  const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
  const userId = userData.user?.id || 1;

  const handleAction = async (action) => {
    if (!["accept", "decline"].includes(action)) return;

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const token = userData?.access_token;
    const userId = userData?.user?.id;

    if (!token) {
      toast.error("You are not logged in.");
      return;
    }

    const payload = {
      allocation_id: asset.allocation_id,
      action,
      user_id: userId,
      remarks: remarks || "",
    };

    try {
      setSaving(true);

      const res = await fetch("http://127.0.0.1:8000/return-action", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to process return action.");
      }

      toast.success(
        `Return request ${
          action === "accept" ? "accepted" : "declined"
        } successfully!`
      );

      if (onUpdated) await onUpdated(); 
      onClose(); 
    } catch (err) {
      console.error("Error handling return action:", err);
      toast.error(err.message || "Failed to process return request.");
    } finally {
      setSaving(false);
    }
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
        <h5 style={{ fontWeight: "500", color: "black" }}>Return Action</h5>
        <span className="d-block mt-2 mb-3" style={{ fontWeight: "500" }}>
          Asset Name: {asset.asset_name}
        </span>

        <small className="d-block mt-2 text-muted">Remarks (Optional):</small>
        <textarea
          className="form-control mt-1"
          rows={4}
          placeholder="Enter remarks about this return"
          value={remarks}
          onChange={handleRemarksChange}
          style={{ resize: "none" }}
        />

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            className="btn btn-outline-dark"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          {asset.action === "accept" && (
            <button
              className="btn btn-success"
              onClick={() => handleAction("accept")}
              disabled={saving}
            >
              {saving ? "Processing..." : "Accept"}
            </button>
          )}

          {asset.action === "decline" && (
            <button
              className="btn btn-danger"
              onClick={() => handleAction("decline")}
              disabled={saving}
            >
              {saving ? "Processing..." : "Reject"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnActionPopup;
