// import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { CircleCheck, Clock, CircleX, Image, Clock1 } from "lucide-react";
// import ImageModal from "./ImageModal";
// import ApproveRepairPopup from "./ApproveRepairRequest";
// import RejectRepairRequest from "./RejectRepairRequest";

// const RepairRequests = () => {
//   const [repairRequests, setRepairRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedRequestData, setSelectedRequestData] = useState(null);

//   // Modal state
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [showModal, setShowModal] = useState(false);

//   const [showApprovePopup, setShowApprovePopup] = useState(false);
//   const [selectedRequestId, setSelectedRequestId] = useState(null);

//   const [showRejectPopup, setShowRejectPopup] = useState(false);
//   const [selectedRejectData, setSelectedRejectData] = useState(null);

//   const [activeView, setActiveView] = useState("requsted");

//   useEffect(() => {
//     fetchPendingRequests();
//     fetchInRepairAssets();
//   }, []);

//   const userData = JSON.parse(sessionStorage.getItem("userData"));
//   const isEmployee = userData.user?.role === "EMPLOYEE";

//   const fetchPendingRequests = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `http://127.0.0.1:8000/repair-requests/pending`,
//         { method: "GET", headers: { "Content-Type": "application/json" } }
//       );
//       if (!response.ok) throw new Error("Failed to fetch pending requests");
//       const data = await response.json();
//       setRepairRequests(data || []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load pending repair requests");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchInRepairAssets = async () => {
//     setLoadingInRepair(true);
//     try {
//       const response = await fetch(
//         `http://127.0.0.1:8000/repair-requests/assets/in-repair`,
//         { method: "GET", headers: { "Content-Type": "application/json" } }
//       );
//       if (!response.ok) throw new Error("Failed to fetch in-repair assets");
//       const data = await response.json();
//       setInRepairAssets(data || []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load in-repair assets");
//     } finally {
//       setLoadingInRepair(false);
//     }
//   };

//   const handleAction = async (id, action) => {
//     try {
//       const url = `http://127.0.0.1:8000/repair-requests/${id}/${action.toLowerCase()}`;
//       const response = await fetch(url, { method: "POST" });
//       if (!response.ok) throw new Error("Failed to update request");
//       toast.success(`Request ${action} successfully`);
//       fetchPendingRequests();
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update request");
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const openImageModal = (images) => {
//     if (!images || images.length === 0) {
//       toast.error("No images available for this request");
//       return;
//     }
//     setSelectedImages(images);
//     setShowModal(true);
//   };

//   const closeImageModal = () => {
//     setSelectedImages([]);
//     setShowModal(false);
//   };

//   const handleApproveClick = (id) => {
//     setSelectedRequestId(id);
//     setShowApprovePopup(true);
//   };

//   return (
//     <main className="flex-grow-1">
//       <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
//         <h4 className="fw-bold" style={{ marginBottom: "12px" }}>
//           Pending Repair Requests
//         </h4>
//       </div>

//       <div className="d-flex mx-4 mt-4 flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-2 rounded p-3 bg-light shadow-sm">
//         <div className="d-flex flex-column mb-2 mb-md-0">
//           <h5 className="text-dark d-flex align-items-center mb-1">
//             <Clock className="me-2 text-muted" size={20} />
//             Pending Requests
//           </h5>
//           <small className="text-muted">
//             Approve or decline pending asset repair requests
//           </small>
//         </div>

//         <div>
//           <div
//             className="btn-group w-100 w-md-auto"
//             role="group"
//             aria-label="View toggle"
//           >
//             <button
//               type="button"
//               className={`btn btn-sm rounded-start ${
//                 activeView === "requsted"
//                   ? "btn-dark text-white"
//                   : "btn-outline-dark"
//               }`}
//               onClick={() => setActiveView("requsted")}
//             >
//               Repair Requsted
//             </button>
//             <button
//               type="button"
//               className={`btn btn-sm rounded-end ${
//                 activeView === "inrepair"
//                   ? "btn-dark text-white"
//                   : "btn-outline-dark"
//               }`}
//               onClick={() => setActiveView("inrepair")}
//             >
//               In Repair
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Conditionally render divs based on activeView */}
//       {activeView === "requsted" && (
//         <div>
//           <div className="shadow rounded mx-4 mt-4">
//             <div className="container-fluid p-0">
//               {loading ? (
//                 <div className="text-center py-5">
//                   <div className="spinner-border text-primary" role="status" />
//                 </div>
//               ) : repairRequests.length === 0 ? (
//                 <div
//                   className="text-center py-5 rounded"
//                   style={{ border: "1px solid lightgrey" }}
//                 >
//                   <p className="text-muted mb-0">No pending repair requests</p>
//                 </div>
//               ) : (
//                 <div
//                   className="table-responsive custom-scroll"
//                   style={{
//                     maxHeight: "500px",
//                     overflowY: "auto",
//                     padding: "20px",
//                   }}
//                 >
//                   <table
//                     className="table mb-0 align-middle text-center"
//                     style={{ width: "100%", minWidth: "1200px" }}
//                   >
//                     <thead>
//                       <tr>
//                         <th>
//                           <small>Emp ID</small>
//                         </th>
//                         <th>
//                           <small>Full Name</small>
//                         </th>
//                         <th>
//                           <small>Email</small>
//                         </th>
//                         <th>
//                           <small>Mobile</small>
//                         </th>
//                         <th>
//                           <small>Designation</small>
//                         </th>
//                         <th>
//                           <small>Location</small>
//                         </th>
//                         <th>
//                           <small>Request Date</small>
//                         </th>
//                         <th>
//                           <small>Issue Description</small>
//                         </th>
//                         <th>
//                           <small>Status</small>
//                         </th>
//                         {!isEmployee && (
//                           <th>
//                             <small>Action</small>
//                           </th>
//                         )}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {repairRequests.map((req) => (
//                         <tr key={req.id}>
//                           <td>
//                             <small>
//                               {req.requested_user?.employee_id || "N/A"}
//                             </small>
//                           </td>
//                           <td>
//                             <small>
//                               {req.requested_user?.fullname || "N/A"}
//                             </small>
//                           </td>
//                           <td>
//                             <small>{req.requested_user?.email || "N/A"}</small>
//                           </td>
//                           <td>
//                             <small>
//                               {req.requested_user?.mobile_no || "N/A"}
//                             </small>
//                           </td>
//                           <td>
//                             <small>
//                               {req.requested_user?.designation || "N/A"}
//                             </small>
//                           </td>
//                           <td>
//                             <small>
//                               {req.requested_user?.location?.locationname ||
//                                 "N/A"}
//                             </small>
//                           </td>
//                           <td>
//                             <small>{formatDate(req.request_date)}</small>
//                           </td>
//                           <td>
//                             <small>{req.issue_description}</small>
//                           </td>
//                           <td>
//                             <small>{req.status}</small>
//                           </td>
//                           {!isEmployee && (
//                             <td className="d-flex gap-2 justify-content-center">
//                               <button
//                                 className="btn btn-success d-flex align-items-center"
//                                 onClick={() => {
//                                   setSelectedRequestData(req);
//                                   setShowApprovePopup(true);
//                                 }}
//                               >
//                                 <CircleCheck size={16} />
//                               </button>
//                               <button
//                                 className="btn btn-danger d-flex align-items-center"
//                                 onClick={() => {
//                                   setSelectedRejectData(req);
//                                   setShowRejectPopup(true);
//                                 }}
//                               >
//                                 <CircleX size={16} />
//                               </button>
//                               <button
//                                 className="btn btn-dark d-flex align-items-center"
//                                 onClick={() => openImageModal(req.images)}
//                               >
//                                 <Image size={16} />
//                               </button>
//                             </td>
//                           )}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//        {activeView === "inrepair" && (
//         <div className="shadow rounded mx-4 mt-4">
//           <div className="container-fluid p-0">
//             {loadingInRepair ? (
//               <div className="text-center py-5">
//                 <div className="spinner-border text-primary" role="status" />
//               </div>
//             ) : inRepairAssets.length === 0 ? (
//               <div
//                 className="text-center py-5 rounded"
//                 style={{ border: "1px solid lightgrey" }}
//               >
//                 <p className="text-muted mb-0">No assets currently in repair</p>
//               </div>
//             ) : (
//               <div
//                 className="table-responsive custom-scroll"
//                 style={{
//                   maxHeight: "500px",
//                   overflowY: "auto",
//                   padding: "20px",
//                 }}
//               >
//                 <table
//                   className="table mb-0 align-middle text-center"
//                   style={{ width: "100%", minWidth: "1200px" }}
//                 >
//                   <thead>
//                     <tr>
//                       <th>Asset Name</th>
//                       <th>Category</th>
//                       <th>Issue Description</th>
//                       <th>Request Date</th>
//                       <th>Employee Name</th>
//                       <th>Emp ID</th>
//                       <th>Email</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {inRepairAssets.map((item) => (
//                       <tr key={item.asset_id}>
//                         <td>{item.asset_name}</td>
//                         <td>{item.category}</td>
//                         <td>{item.issue_description}</td>
//                         <td>{formatDate(item.request_date)}</td>
//                         <td>{item.requested_user.fullname}</td>
//                         <td>{item.requested_user.employee_id}</td>
//                         <td>{item.requested_user.email}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//              </div>
//         </div>
//       )}

//       {/* {reject the repair request} */}
//       {showRejectPopup && selectedRejectData && (
//         <RejectRepairRequest
//           requestData={selectedRejectData} // pass row data
//           rejectedBy={userData.user.id}
//           onClose={() => setShowRejectPopup(false)}
//           onRejected={fetchPendingRequests}
//         />
//       )}

//       {/* {approve the repair request} */}
//       {showApprovePopup && selectedRequestData && (
//         <ApproveRepairPopup
//           requestData={selectedRequestData} // entire row
//           approvedBy={userData.user.id}
//           onClose={() => setShowApprovePopup(false)}
//           onApproved={fetchPendingRequests}
//         />
//       )}

//       {/* Image Modal */}
//       <ImageModal
//         images={selectedImages}
//         show={showModal}
//         onClose={closeImageModal}
//       />
//     </main>
//   );
// };

// export default RepairRequests;

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CircleCheck, Clock, CircleX, Image } from "lucide-react";
import ImageModal from "./ImageModal";
import ApproveRepairPopup from "./ApproveRepairRequest";
import RejectRepairRequest from "./RejectRepairRequest";

const RepairRequests = () => {
  // States
  const [repairRequests, setRepairRequests] = useState([]);
  const [inRepairAssets, setInRepairAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInRepair, setLoadingInRepair] = useState(true);
  const [selectedRequestData, setSelectedRequestData] = useState(null);

  // Modal state
  const [selectedImages, setSelectedImages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [showApprovePopup, setShowApprovePopup] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [selectedRejectData, setSelectedRejectData] = useState(null);

  const [activeView, setActiveView] = useState("requsted");

  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const isEmployee = userData.user?.role === "EMPLOYEE";

  // Fetch pending requests
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

  // Fetch in-repair assets
  const fetchInRepairAssets = async () => {
    setLoadingInRepair(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/repair-requests/assets/in-repair`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error("Failed to fetch in-repair assets");
      const data = await response.json();
      setInRepairAssets(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load in-repair assets");
    } finally {
      setLoadingInRepair(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    fetchInRepairAssets();
  }, []);

  // Approve/Reject action
  const handleAction = async (id, action) => {
    try {
      const url = `http://127.0.0.1:8000/repair-requests/${id}/${action.toLowerCase()}`;
      const response = await fetch(url, { method: "POST" });
      if (!response.ok) throw new Error("Failed to update request");
      toast.success(`Request ${action} successfully`);
      fetchPendingRequests();
      fetchInRepairAssets();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update request");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Image modal
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

  return (
    <main className="flex-grow-1">
      <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
        <h4 className="fw-bold" style={{ marginBottom: "12px" }}>
          Repair Requests
        </h4>
      </div>

      {/* Toggle buttons */}
      <div className="d-flex mx-4 mt-4 flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-2 rounded p-3 bg-light shadow-sm">
        <div className="d-flex flex-column mb-2 mb-md-0">
          <h5 className="text-dark d-flex align-items-center mb-1">
            <Clock className="me-2 text-muted" size={20} />
            Requests
          </h5>
          <small className="text-muted">Approve or view in-repair assets</small>
        </div>

        <div>
          <div
            className="btn-group w-100 w-md-auto"
            role="group"
            aria-label="View toggle"
          >
            <button
              type="button"
              className={`btn btn-sm rounded-start ${
                activeView === "requsted"
                  ? "btn-dark text-white"
                  : "btn-outline-dark"
              }`}
              onClick={() => setActiveView("requsted")}
            >
              Repair Requested
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-end ${
                activeView === "inrepair"
                  ? "btn-dark text-white"
                  : "btn-outline-dark"
              }`}
              onClick={() => setActiveView("inrepair")}
            >
              In Repair
            </button>
          </div>
        </div>
      </div>

      {/* Pending Requests Table */}
      {activeView === "requsted" && (
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
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  padding: "20px",
                }}
              >
                <table
                  className="table mb-0 align-middle text-center"
                  style={{ width: "100%", minWidth: "1200px" }}
                >
                  <thead>
                    <tr>
                      <th>Emp ID</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Designation</th>
                      <th>Location</th>
                      <th>Request Date</th>
                      <th>Issue Description</th>
                      <th>Status</th>
                      {!isEmployee && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {repairRequests.map((req) => (
                      <tr key={req.id}>
                        <td>{req.requested_user?.employee_id || "N/A"}</td>
                        <td>{req.requested_user?.fullname || "N/A"}</td>
                        <td>{req.requested_user?.email || "N/A"}</td>
                        <td>{req.requested_user?.mobile_no || "N/A"}</td>
                        <td>{req.requested_user?.designation || "N/A"}</td>
                        <td>
                          {req.requested_user?.location?.locationname || "N/A"}
                        </td>
                        <td>{formatDate(req.request_date)}</td>
                        <td>{req.issue_description}</td>
                        <td>{req.status}</td>
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
      )}

      {/* In Repair Assets Table */}
      {activeView === "inrepair" && (
        <div className="shadow rounded mx-4 mt-4">
          <div className="container-fluid p-0">
            {loadingInRepair ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : inRepairAssets.length === 0 ? (
              <div
                className="text-center py-5 rounded"
                style={{ border: "1px solid lightgrey" }}
              >
                <p className="text-muted mb-0">No data found</p>
              </div>
            ) : (
              <div
                className="table-responsive custom-scroll"
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  padding: "20px",
                }}
              >
                <table
                  className="table mb-0 align-middle text-center"
                  style={{ width: "100%", minWidth: "1000px" }}
                >
                  <thead>
                    <tr>
                      <th>
                        <small>SL. No</small>
                      </th>
                      <th>
                        <small>Asset Name</small>
                      </th>
                      <th>
                        <small>Category</small>
                      </th>
                      <th>
                        <small>Issue Description</small>
                      </th>
                      <th>
                        <small>Action</small>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inRepairAssets.map((item, index) => (
                      <tr key={item.asset_id}>
                        <td>
                          <small>{index + 1}</small>
                        </td>
                        <td>
                          <small>{item.asset_name}</small>
                        </td>
                        <td>
                          <small>{item.category}</small>
                        </td>
                        <td>
                          <small>{item.issue_description}</small>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-dark"
                            onClick={() => handleMarkAsRepaired(item.asset_id)}
                          >
                            Marked As Repaired
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Popup */}
      {showRejectPopup && selectedRejectData && (
        <RejectRepairRequest
          requestData={selectedRejectData}
          rejectedBy={userData.user.id}
          onClose={() => setShowRejectPopup(false)}
          onRejected={fetchPendingRequests}
        />
      )}

      {/* Approve Popup */}
      {showApprovePopup && selectedRequestData && (
        <ApproveRepairPopup
          requestData={selectedRequestData}
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
