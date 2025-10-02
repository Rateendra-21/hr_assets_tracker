import { useState } from "react";
import { toast } from "react-hot-toast";

const ReturnAsset = ({ asset, onClose, onUpdated }) => {
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const handleModalClick = (e) => e.stopPropagation();

  const handleRemarksChange = (e) => {
    const value = e.target.value;
    if (value.length === 1 && value === " ") return;
    setRemarks(value);
  };

  const handleSave = async () => {
    const payload = {
      allocation_id: asset.allocation_id,
      notes: remarks || "",
    };

    try {
      setSaving(true);
      const res = await fetch("http://127.0.0.1:8000/return-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to return asset.");
      }

      toast.success("Asset returned successfully!");

      if (onUpdated) await onUpdated(); // call parent to refresh list
      onClose(); // close modal
    } catch (err) {
      toast.error(err.message || "Failed to return asset.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050 }} onClick={onClose}>
      <div onClick={handleModalClick} style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "20px", width: "100%", maxWidth: "500px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        <h5 style={{ fontWeight: "500", color: "black" }}>Return Asset</h5>
        <span className="d-block mt-2 mb-3" style={{ fontWeight: "500" }}>Asset Name: {asset.asset_name}</span>

        <small className="d-block mt-2 text-muted">Remarks (Optional):</small>
        <textarea className="form-control mt-1" rows={4} placeholder="Enter any remarks about the asset condition" value={remarks} onChange={handleRemarksChange} style={{ resize: "none" }} />

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-outline-dark" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-dark" onClick={handleSave} disabled={saving}>{saving ? "Processing..." : "Return Asset"}</button>
        </div>
      </div>
    </div>
  );
};

export default ReturnAsset;
