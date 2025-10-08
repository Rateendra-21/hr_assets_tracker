import { useState } from "react";
import { toast } from "react-hot-toast";

const RejectRepairRequest = ({
  requestData,
  rejectedBy,
  onClose,
  onRejected,
}) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);   // Add loading state
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Please enter rejection remark");
      return;
    }

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const token = userData?.access_token;

    if (!token) {
      toast.error("You are not logged in.");
      return;
    }

    setLoading(true);  // Start loader

    try {
      const formData = new URLSearchParams();
      formData.append("rejected_by", rejectedBy);
      formData.append("remark", reason);

      const response = await fetch(`${baseUrl}/repair-requests/reject/${requestData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: formData.toString(),
      });

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to reject request");
      }

      toast.success("Request rejected successfully");
      onRejected?.();
      onClose();
      setReason("");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to reject request");
    } finally {
      setLoading(false);  // Stop loader
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">
          <h5 className="fw-bold mb-3">Reject Repair Request</h5>
          <p>
            <strong>Employee:</strong> {requestData.requested_user?.fullname}
          </p>
          <p>
            <strong>Issue:</strong> {requestData.issue_description}
          </p>

          <textarea
            className="form-control mb-3"
            placeholder="Enter rejection reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}  // disable on loading
          />

          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleReject} disabled={loading || !reason.trim()}>
              {loading ? "Processing..." : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectRepairRequest;

