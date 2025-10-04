import { useState } from "react";
import { toast } from "react-hot-toast";

const RejectRepairRequest = ({
  requestData,
  rejectedBy,
  onClose,
  onRejected,
}) => {
  const [reason, setReason] = useState("");

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

    try {
      const formData = new URLSearchParams();
      formData.append("rejected_by", rejectedBy);
      formData.append("remark", reason); // backend expects `remark`

      const response = await fetch(
        `http://127.0.0.1:8000/repair-requests/reject/${requestData.id}`,
        {
          method: "PUT",
          headers: {
             "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`,
          },
          body: formData.toString(),
        }
      );

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
          />

          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleReject}>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectRepairRequest;
