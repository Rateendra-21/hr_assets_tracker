// import { useState, useEffect } from "react";
// import ReturnAsset from "../Assets/ReturnAsset";

// const AssignedList = () => {
//   const [assignedAssets, setAssignedAssets] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [selectedAsset, setSelectedAsset] = useState(null); // Asset for return modal
//   const [showReturnModal, setShowReturnModal] = useState(false);


//   // Fetch assigned assets from API
//   const fetchAssignedAssets = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("http://127.0.0.1:8000/assigned");
//       const data = await response.json();
//       setAssignedAssets(data);
//     } catch (error) {
//       console.error("Error fetching assigned assets:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAssignedAssets();
//   }, []);



//   const handleReturn = (allocation_id) => {
//     const asset = assignedAssets.find(a => a.allocation_id === allocation_id);
//     if (asset) {
//       setSelectedAsset(asset);
//       setShowReturnModal(true);
//     }
//   };

//     const handleAssetReturned = async () => {
//     setShowReturnModal(false);
//     setSelectedAsset(null);
//     await fetchAssignedAssets();
//   };

//   return (
//     <div>
//       <h5 className="mb-3">Assigned Assets List</h5>

//       {loading ? (
//         <div className="text-center py-5">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : assignedAssets.length === 0 ? (
//         <p className="text-muted">No assigned assets found.</p>
//       ) : (
//         <div className="rounded" style={{ border: "1px solid lightgrey" }}>
//           <div
//             className="table-responsive custom-scroll"
//             style={{
//               maxHeight: "500px",
//               overflowY: "auto",
//               overflowX: "auto",
//               padding: "20px",
//             }}
//           >
//             <table
//               className="table mb-0 align-middle text-center"
//               style={{ width: "100%", minWidth: "1000px" }}
//             >
//               <thead>
//                 <tr>
//                   <th>
//                     <small>Employee Name</small>
//                   </th>
//                   <th>
//                     <small>Asset Name</small>
//                   </th>
//                   <th>
//                     <small>Category</small>
//                   </th>
//                   <th>
//                     <small>Allocated By</small>
//                   </th>
//                   <th>
//                     <small>Allocation Date</small>
//                   </th>
//                   <th>
//                     <small>Designation</small>
//                   </th>
//                   <th>
//                     <small>Manufacturer</small>
//                   </th>
//                   <th>
//                     <small>Actions</small>
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {assignedAssets.map((asset) => (
//                   <tr key={asset.allocation_id}>
//                     <td>
//                       <small>{asset.employee_name}</small>
//                     </td>
//                     <td>
//                       <small>{asset.asset_name}</small>
//                     </td>
//                     <td>
//                       <small>{asset.category || "-"}</small>
//                     </td>
//                     <td>
//                       <small>{asset.allocated_by_name}</small>
//                     </td>
//                     <td>
//                       <small>
//                         {new Date(asset.allocation_date).toLocaleDateString(
//                           "en-GB",
//                           {
//                             day: "2-digit",
//                             month: "short",
//                             year: "numeric",
//                           }
//                         )}
//                       </small>
//                     </td>
//                     <td>
//                       <small>{asset.designation || "-"}</small>
//                     </td>
//                     <td>
//                       <small>{asset.manufacturer || "-"}</small>
//                     </td>
//                     <td className="d-flex justify-content-center gap-2">
//                       <button
//                         className="btn btn-sm btn-success"
//                         onClick={() => handleReturn(asset.allocation_id)}
//                       >
//                         Return
//                       </button>
                    
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Return Asset Modal */}
//       {showReturnModal && selectedAsset && (
//         <ReturnAsset
//           asset={selectedAsset}
//           onClose={() => setShowReturnModal(false)}
//           onUpdated={handleAssetReturned}
          
//         />
//       )}

//     </div>
//   );
// };

// export default AssignedList;






















import { useState, useEffect } from "react";
import ReturnAsset from "../Assets/ReturnAsset";

const AssignedList = ({ refreshAssets }) => {
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState(null); // Asset for return modal
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Fetch assigned assets from API
  const fetchAssignedAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/assigned");
      const data = await response.json();
      setAssignedAssets(data);
    } catch (error) {
      console.error("Error fetching assigned assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedAssets();
  }, []);

  const handleReturn = (allocation_id) => {
    const asset = assignedAssets.find((a) => a.allocation_id === allocation_id);
    if (asset) {
      setSelectedAsset(asset);
      setShowReturnModal(true);
    }
  };

  const handleAssetReturned = async () => {
    setShowReturnModal(false);
    setSelectedAsset(null);
    await fetchAssignedAssets(); // refresh assigned list
    if (refreshAssets) refreshAssets(); // refresh Assign.jsx asset list
  };

  return (
    <div>
      <h5 className="mb-3">Assigned Assets List</h5>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : assignedAssets.length === 0 ? (
        <p className="text-muted">No assigned assets found.</p>
      ) : (
        <div className="rounded" style={{ border: "1px solid lightgrey" }}>
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
              style={{ width: "100%", minWidth: "1000px" }}
            >
              <thead>
                <tr>
                  <th>
                    <small>Employee Name</small>
                  </th>
                  <th>
                    <small>Asset Name</small>
                  </th>
                  <th>
                    <small>Category</small>
                  </th>
                  <th>
                    <small>Allocated By</small>
                  </th>
                  <th>
                    <small>Allocation Date</small>
                  </th>
                  <th>
                    <small>Designation</small>
                  </th>
                  <th>
                    <small>Manufacturer</small>
                  </th>
                  <th>
                    <small>Actions</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignedAssets.map((asset) => (
                  <tr key={asset.allocation_id}>
                    <td>
                      <small>{asset.employee_name}</small>
                    </td>
                    <td>
                      <small>{asset.asset_name}</small>
                    </td>
                    <td>
                      <small>{asset.category || "-"}</small>
                    </td>
                    <td>
                      <small>{asset.allocated_by_name}</small>
                    </td>
                    <td>
                      <small>
                        {new Date(asset.allocation_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </small>
                    </td>
                    <td>
                      <small>{asset.designation || "-"}</small>
                    </td>
                    <td>
                      <small>{asset.manufacturer || "-"}</small>
                    </td>
                    <td className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleReturn(asset.allocation_id)}
                      >
                        Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Asset Modal */}
      {showReturnModal && selectedAsset && (
        <ReturnAsset
          asset={selectedAsset}
          onClose={() => setShowReturnModal(false)}
          onUpdated={handleAssetReturned}
        />
      )}
    </div>
  );
};

export default AssignedList;

