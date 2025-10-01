import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CircleCheck, Clock, CircleX, Image } from "lucide-react";
import ImageModal from "./ImageModal";
import ApproveRepairPopup from "./ApproveRepairRequest";
import RejectRepairRequest from "./RejectRepairRequest";

const RepairRequests = () => {
  const [repairRequests, setRepairRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestData, setSelectedRequestData] = useState(null);

  // Modal state
  const [selectedImages, setSelectedImages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [selectedRejectData, setSelectedRejectData] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const isEmployee = userData.user?.role === "EMPLOYEE";

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/repair-requests/pending`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error("Failed to fetch pending requests");
      const data = await response.json();
      setRepairRequests(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pending repair requests");
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
      fetchPendingRequests();
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

  const openImageModal = (images) => {
    if (!images || images.length === 0) {
      toast.error("No images available for this request");
      return;
    }
    setSelectedImages(images);
    setShowModal(true);
  };

  const closeImageModal = () => {
    setSelectedImages([]);
    setShowModal(false);
  };

  const handleApproveClick = (id) => {
    setSelectedRequestId(id);
    setShowApprovePopup(true);
  };

  return (
    <main className="flex-grow-1">
      <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
        <h4 className="fw-bold" style={{ marginBottom: "12px" }}>
          Pending Repair Requests
        </h4>
      </div>

      <div className="d-flex mx-4 mt-4 flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-2 rounded p-3 bg-light shadow-sm">
        <div className="d-flex flex-column mb-2 mb-md-0">
          <h5 className="text-dark fw-bold mb-1">
            <Clock size={17} className="me-2" />
            Pending Requests
          </h5>
          <small className="text-muted">
            Approve or decline pending asset repair requests
          </small>
        </div>
      </div>

      <div className="shadow rounded mx-4 mt-4">
        <div className="container-fluid p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
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
              style={{ maxHeight: "500px", overflowY: "auto", padding: "20px" }}
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
                            className="btn btn-success d-flex align-items-center"
                            onClick={() => {
                              setSelectedRequestData(req);
                              setShowApprovePopup(true);
                            }}
                          >
                            <CircleCheck size={16} />
                          </button>
                          <button
                            className="btn btn-danger d-flex align-items-center"
                            onClick={() => {
                              setSelectedRejectData(req);
                              setShowRejectPopup(true);
                            }}
                          >
                            <CircleX size={16} />
                          </button>
                          <button
                            className="btn btn-dark d-flex align-items-center"
                            onClick={() => openImageModal(req.images)}
                          >
                            <Image size={16} />
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

      {/* {reject the repair request} */}
      {showRejectPopup && selectedRejectData && (
        <RejectRepairRequest
          requestData={selectedRejectData} // pass row data
          rejectedBy={userData.user.id}
          onClose={() => setShowRejectPopup(false)}
          onRejected={fetchPendingRequests}
        />
      )}

      {/* {approve the repair request} */}
      {showApprovePopup && selectedRequestData && (
        <ApproveRepairPopup
          requestData={selectedRequestData} // entire row
          approvedBy={userData.user.id}
          onClose={() => setShowApprovePopup(false)}
          onApproved={fetchPendingRequests}
        />
      )}

      {/* Image Modal */}
      <ImageModal
        images={selectedImages}
        show={showModal}
        onClose={closeImageModal}
      />
    </main>
  );
};

export default RepairRequests;
