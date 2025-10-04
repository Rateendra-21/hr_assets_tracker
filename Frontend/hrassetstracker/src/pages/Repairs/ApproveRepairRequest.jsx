import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const ApproveRepairPopup = ({
  requestData,
  approvedBy,
  onClose,
  onApproved,
}) => {
  const [vendorName, setVendorName] = useState("");
  const [loading, setLoading] = useState(false);

  // Destructure values from requestData
  const {
    id: requestId,
    asset_name: assetName,
    issue_description: issueDescription,
  } = requestData;

  useEffect(() => {
    console.log("Popup opened with data:", requestData);
  }, [requestData]);

  const handleApprove = async () => {
    if (!vendorName.trim()) {
      toast.error("Please enter vendor name");
      return;
    }

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const token = userData?.access_token;

    if (!token) {
      toast.error("You are not logged in.");
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("approved_by", approvedBy);
      formData.append("vendor_name", vendorName);

      const res = await fetch(
        `http://127.0.0.1:8000/repair-requests/approve/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
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
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to approve repair request");
      }

      toast.success("Repair request approved successfully!");
      onApproved?.(); // optional chaining to avoid runtime errors
      onClose();
      setVendorName(""); // clear input
    } catch (error) {
      toast.error(error.message || "Error approving repair request");
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
      onClick={onClose} // click outside closes
    >
      <div
        onClick={(e) => e.stopPropagation()} // prevent click inside closing
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
          Approve Repair Request
        </h5>

        {/* Display asset name and issue */}
        <div className="mb-3">
          <p>
            <strong>Issue:</strong> {issueDescription || "N/A"}
          </p>
        </div>

        <input
          type="text"
          placeholder="Enter Vendor Name"
          className="form-control mb-3"
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
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
            onClick={handleApprove}
            disabled={!vendorName.trim() || loading}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveRepairPopup;
