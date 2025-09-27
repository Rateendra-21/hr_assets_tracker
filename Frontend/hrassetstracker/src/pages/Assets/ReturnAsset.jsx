import { useState } from "react";
import { toast } from "react-hot-toast";

const ReturnAsset = ({ asset, onClose, onUpdated }) => {
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

  // Save remarks and return asset
  const handleSave = async () => {
    try {
      setSaving(true);
const res = await fetch(
  `http://127.0.0.1:8000/assets/return-asset?asset_id=${asset.id}${remarks ? `&remarks=${encodeURIComponent(remarks)}` : ''}`,
  {
    method: "POST",
  }
);


      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to return asset.");
      }

      toast.success("Asset returned successfully!");

      // Notify parent to refresh AssetList
      if (onUpdated) onUpdated();

      // Close modal
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to return asset.");
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
          Return Asset
        </h5>
        <span className="d-block mt-2 mb-3" style={{ fontWeight: "500" }}>
          Asset Name: {asset.asset_name}
        </span>

        <small className="d-block mt-2 text-muted">Remarks (Optional):</small>
        <textarea
          className="form-control mt-1"
          rows="4"
          placeholder="Enter any remarks about the asset condition"
          value={remarks}
          onChange={handleRemarksChange}
          style={{ resize: "none" }}
        />

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Processing..." : "Return Asset"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnAsset;