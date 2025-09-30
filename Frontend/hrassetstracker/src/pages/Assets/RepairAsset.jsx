import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const RepairAsset = ({ asset, onClose, onUpdated }) => {
  const [issueDescription, setIssueDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [assetId, setAssetId] = useState(null);

  useEffect(() => {
    if (asset) {
      console.log("Modal opened with asset:", asset.asset_id); // use asset_id
    }
  }, [asset]);

  const handleModalClick = (e) => e.stopPropagation();

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length === 1 && value === " ") return;
    setIssueDescription(value);
  };

  const handleSave = async () => {
    if (!issueDescription.trim()) {
      toast.error("Issue description cannot be empty.");
      return;
    }

    if (!asset || !asset.asset_id) {
      toast.error("Asset data not available.");
      return;
    }

    const payload = {
      asset_id: asset.asset_id,
      requested_by: JSON.parse(sessionStorage.getItem("userData"))?.user?.id,
      issue_description: issueDescription.trim(),
    };

    try {
      setSaving(true);

      const res = await fetch(`http://127.0.0.1:8000/repair-requests/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create repair request.");
      }

      toast.success("Asset sent for repair successfully!");

      // ONLY call onUpdated(), which handles closing the popup and refreshing table
      if (onUpdated) onUpdated();

      // REMOVE onClose() here
      // onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create repair request.");
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
        <h5 style={{ fontWeight: "500", color: "black" }}>Repair Request</h5>
        <span className="d-block mt-2 mb-3" style={{ fontWeight: "500" }}>
          Asset Name: {asset.asset_name}
        </span>

        <small className="d-block mt-2 text-muted">Issue Description:</small>
        <textarea
          className="form-control mt-1"
          rows="4"
          placeholder="Describe the issue with this asset"
          value={issueDescription}
          onChange={handleDescriptionChange}
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
          <button
            className="btn btn-dark"
            onClick={handleSave}
            disabled={saving || !issueDescription.trim()}
          >
            {saving ? "Processing..." : "Submit Repair Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairAsset;
