import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const RepairRequests = () => {
  const [repairRequests, setRepairRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const isEmployee = userData.user?.role === "EMPLOYEE";

  console.log("Data", isEmployee);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/repair-requests/pending`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch pending requests");

      const data = await response.json();

      // Set data even if empty
      setRepairRequests(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pending repair requests"); // only on fetch/network error
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const url = `http://127.0.0.1:8000/repair-requests/${id}/${action.toLowerCase()}`;
      const response = await fetch(url, { method: "POST" });

      if (!response.ok) throw new Error("Failed to update request");

      toast.success(`Request ${action} successfully`);
      fetchPendingRequests(); // refresh table
    } catch (err) {
      console.error(err);
      toast.error("Failed to update request");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="flex-grow-1">
      <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
        <h4 className="fw-bold" style={{ marginBottom: "12px" }}>
          Pending Repair Requests
        </h4>
      </div>

      <div className="py-3 px-2 px-md-4" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="row align-items-center mb-3">
          <div className="col mb-2 mb-md-0">
            <h5 className="fw-bold mb-1">Pending Requests</h5>
            <span className="text-muted">
              Approve or decline pending asset repair requests
            </span>
          </div>
        </div>
      </div>

      <div
        className="shadow rounded mx-3 mt-4"
        style={{ border: "1px solid lightgrey" }}
      >
        <div className="container-fluid p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : repairRequests.length === 0 ? (
            <div
              className="text-center py-5 rounded"
              style={{ border: "1px solid lightgrey" }}
            >
              <p className="text-muted mb-0">No pending repair requests</p>
            </div>
          ) : (
            <div
              className="table-responsive custom-scroll"
              style={{
                maxHeight: "500px",
                overflowY: "auto",
                overflowX: "auto",
                padding: "20px",
              }}
            >
              <table
                className="table mb-0 align-middle text-center"
                style={{ width: "100%", minWidth: "1200px" }}
              >
                <thead>
                  <tr>
                    <th>
                      <small>Emp ID</small>
                    </th>
                    <th>
                      <small>Full Name</small>
                    </th>
                    <th>
                      <small>Email</small>
                    </th>
                    <th>
                      <small>Mobile</small>
                    </th>
                    <th>
                      <small>Designation</small>
                    </th>
                    <th>
                      <small>Location</small>
                    </th>
                    <th>
                      <small>Request Date</small>
                    </th>
                    <th>
                      <small>Issue Description</small>
                    </th>
                    <th>
                      <small>Status</small>
                    </th>
                    {!isEmployee && (
                      <th>
                        <small>Action</small>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {repairRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <small>
                          {req.requested_user?.employee_id || "N/A"}
                        </small>
                      </td>
                      <td>
                        <small>{req.requested_user?.fullname || "N/A"}</small>
                      </td>
                      <td>
                        <small>{req.requested_user?.email || "N/A"}</small>
                      </td>
                      <td>
                        <small>{req.requested_user?.mobile_no || "N/A"}</small>
                      </td>
                      <td>
                        <small>
                          {req.requested_user?.designation || "N/A"}
                        </small>
                      </td>
                      <td>
                        <small>
                          {req.requested_user?.location?.locationname || "N/A"}
                        </small>
                      </td>
                      <td>
                        <small>{formatDate(req.request_date)}</small>
                      </td>
                      <td>
                        <small>{req.issue_description}</small>
                      </td>
                      <td>
                        <small>{req.status}</small>
                      </td>

                      {!isEmployee && (
                        <td className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleAction(req.id, "APPROVED")}
                          >
                            <small>Approve</small>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleAction(req.id, "REJECTED")}
                          >
                            <small>Decline</small>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default RepairRequests;
