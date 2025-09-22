import { useState } from "react";
import { toast } from "react-hot-toast";

const EwasteAsset = ({ asset, onClose, onUpdated }) => {
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  // Prevent modal close when clicking inside
  const handleModalClick = (e) => e.stopPropagation();

  // Handle textarea input
  const handleRemarksChange = (e) => {
    const value = e.target.value;
    if (value.length === 1 && value === " ") return; // prevent starting with space
    setRemarks(value);
  };

  // Save remarks and mark as E-Waste
  const handleSave = async () => {
    // Validation
    if (!remarks.trim()) {
      toast.error("Remarks cannot be empty.");
      return;
    }
    if (remarks.startsWith(" ")) {
      toast.error("Remarks cannot start with a space.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(
        `http://127.0.0.1:8000/assets/ewaste/${asset.id}?remarks=${encodeURIComponent(
          remarks
        )}`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to update asset.");
      }

      toast.success("Asset marked as E-Waste successfully!");

      // Notify parent to refresh AssetList
      if (onUpdated) onUpdated();

      // Close modal
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to mark asset as E-Waste.");
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
        <h5 style={{ fontWeight: "500", color: "black" }}>
          Mark Asset as E-Waste
        </h5>
        <span className="d-block mt-2 mb-3" style={{ fontWeight: "500" }}>
          Asset Name: {asset.asset_name}
        </span>

        <small className="d-block mt-2 text-muted">Remarks:</small>
        <textarea
          className="form-control mt-1"
          rows="4"
          placeholder="Enter remarks for e-waste"
          value={remarks}
          onChange={handleRemarksChange}
          style={{ resize: "none" }}
        />

        <div className="mt-3 d-flex justify-content-end gap-2">
          <button
            className="btn btn-outline-dark"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-dark"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Mark as E-Waste"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EwasteAsset;
