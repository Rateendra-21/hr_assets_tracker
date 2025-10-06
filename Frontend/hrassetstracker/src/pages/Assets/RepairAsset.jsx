import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus } from "lucide-react";

const RepairAsset = ({ asset, onClose, onUpdated, fetchAssets }) => {
  const [issueDescription, setIssueDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [attachedImages, setAttachedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [myAssetId, setMyAssetId] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (asset) {
      setMyAssetId(asset.asset_id || asset.id);
    }
  }, [asset]);

  const handleModalClick = (e) => e.stopPropagation();

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length === 1 && value === " ") return;
    setIssueDescription(value);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setAttachedImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };


  const handleSave = async () => {
    console.log("Current asset value:", asset);

    if (!issueDescription.trim()) {
      toast.error("Issue description cannot be empty.");
      return;
    }

    if (!myAssetId) {
      toast.error("Asset data not available.");
      return;
    }

    try {
      setSaving(true);

      const token = JSON.parse(
        sessionStorage.getItem("userData")
      )?.access_token;
      if (!token) {
        toast.error("You are not logged in.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const formData = new FormData();
      formData.append("asset_id", myAssetId);
      formData.append(
        "requested_by",
        JSON.parse(sessionStorage.getItem("userData"))?.user?.id
      );
      formData.append("issue_description", issueDescription.trim());

      attachedImages.forEach((file) => {
        formData.append("images", file);
      });

      const res = await fetch(`${baseUrl}/repair-requests/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token here
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create repair request.");
      }

      toast.success("Asset sent for repair successfully!");
      if (onUpdated) onUpdated();

      setIssueDescription("");
      setAttachedImages([]);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create repair request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Main Modal */}
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

          {/* Issue Description */}
          <small className="d-block mt-2 text-muted">Issue Description:</small>
          <textarea
            className="form-control mt-1"
            rows="3"
            placeholder="Describe the issue with this asset"
            value={issueDescription}
            onChange={handleDescriptionChange}
            style={{ resize: "none" }}
          />

          {/* Preview Selected Images */}
          {attachedImages.length > 0 && (
            <div
              className="mt-3 mb-3"
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              {attachedImages.map((file, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Attachment ${index + 1}`}
                    onClick={() => setPreviewImage(URL.createObjectURL(file))}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      cursor: "pointer",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "-15px",
                      background: "black",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "25px",
                      height: "25px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="d-flex justify-content-between align-items-center gap-2 mt-3">
            {/* Left: Upload Images */}
            <div>
              <label className="btn btn-success btn-sm">
                Upload Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Right: Cancel & Submit */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-dark btn-sm"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-dark btn-sm"
                onClick={handleSave}
                disabled={saving || !issueDescription.trim()}
              >
                {saving ? "Processing..." : "Submit Repair Request"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
        >
          <img
            src={previewImage}
            alt="Preview"
            onClick={(e) => e.stopPropagation()} // stops closing the image when clicked
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          />
        </div>
      )}
    </>
  );
};

export default RepairAsset;
