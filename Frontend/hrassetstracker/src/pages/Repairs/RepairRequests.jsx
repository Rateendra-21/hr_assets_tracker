import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../../config/api";

const RepairRequests = () => {
  const [repairRequests, setRepairRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const isAdmin = userData?.is_admin || userData?.role === "ADMIN" || userData?.role === "SUPER_ADMIN";

  useEffect(() => {
    fetchRepairRequests();
  }, []);

  const fetchRepairRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/repair-requests/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch repair requests");
      }

      const data = await response.json();
      setRepairRequests(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching repair requests:", err);
      setError("Failed to load repair requests. Please try again.");
      toast.error("Failed to load repair requests");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { color: "warning", text: "Pending" },
      IN_PROGRESS: { color: "primary", text: "In Progress" },
      COMPLETED: { color: "success", text: "Completed" },
      REJECTED: { color: "danger", text: "Rejected" },
    };

    const statusInfo = statusMap[status] || { color: "secondary", text: status };

    return (
      <span className={`badge bg-${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="flex-grow-1">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
        <h4 className="fw-bold" style={{ marginBottom: "12px" }}>
          Repair Requests
        </h4>
      </div>

      {/* Subtitle */}
      <div className="py-3 px-2 px-md-4" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="row align-items-center mb-3">
          <div className="col mb-2 mb-md-0">
            <h5 className="fw-bold mb-1">My Repair Requests</h5>
            <span className="text-muted">
              View and track your asset repair requests
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : repairRequests.length === 0 ? (
          <div className="text-center py-5 rounded border">
            <p className="text-muted mb-0">No repair requests found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Request ID</th>
                  <th>Asset</th>
                  <th>Issue Description</th>
                  <th>Status</th>
                  <th>Request Date</th>
                  <th>Resolution Date</th>
                  <th>Resolution Notes</th>
                </tr>
              </thead>
              <tbody>
                {repairRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.asset?.asset_name || "N/A"}</td>
                    <td>{request.issue_description}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>{formatDate(request.request_date)}</td>
                    <td>{formatDate(request.resolution_date)}</td>
                    <td>{request.resolution_notes || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default RepairRequests;