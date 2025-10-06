import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const RepairAccept = ({ requestData, onClose, onApproved }) => {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  // Destructure values from requestData
  const {
    asset_id: assetId,
    asset_name: assetName,
    issue_description: issueDescription,
  } = requestData;

  useEffect(() => {
    console.log("RepairAccept opened with data:", requestData);
  }, [requestData]);

  const handleAccept = async () => {
    if (!remarks.trim()) {
      toast.error("Please enter remarks");
      return;
    }

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const userId = userData?.user?.id;
    const token = userData?.access_token;

    if (!userId || !token) {
      toast.error("You are not logged in or user not found.");
      sessionStorage.removeItem("userData");
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("user_id", String(userId)); // always send as string
      formData.append("remarks", remarks.trim());

      console.log("Payload being sent:", formData.toString());

      const res = await fetch(
        `${baseUrl}/repair-requests/assets/mark-repaired/${assetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`,
          },
          body: formData.toString(),
        }
      );

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to mark asset as repaired");
      }

      toast.success("Asset marked as repaired successfully!");
      onApproved?.();
      onClose();
      setRemarks("");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error completing repair request");
    } finally {
      setLoading(false);
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
      onClick={onClose} // click outside closes modal
    >
      <div
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "20px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <h5 style={{ fontWeight: 500, marginBottom: "15px" }}>
          Mark Asset as Repaired
        </h5>

        {/* Show some request details */}
        <div className="mb-3">
          <p>
            <strong>Asset:</strong> {assetName || "N/A"}
          </p>
          <p>
            <strong>Issue:</strong> {issueDescription || "N/A"}
          </p>
        </div>

        <textarea
          placeholder="Enter Remarks"
          className="form-control mb-3"
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          disabled={loading}
        />

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            className="btn btn-outline-dark"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-success"
            onClick={handleAccept}
            disabled={!remarks.trim() || loading}
          >
            {loading ? "Saving..." : "Mark Repaired"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepairAccept;
