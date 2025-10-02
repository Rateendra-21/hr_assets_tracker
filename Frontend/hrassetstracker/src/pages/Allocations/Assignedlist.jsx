import { useState, useEffect } from "react";
import ReturnActionPopup from "../Assets/ReturnActionPopup";

const AssignedList = ({ refreshAssets }) => {
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState(null);

  // Fetch assigned assets from API

  const fetchAssignedAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/assigned");
      const data = await response.json();
      const assignedOnly = data.filter(
        (asset) =>
          asset.status === "ASSIGNED" || asset.status === "RETURN_PENDING"
      );
      setAssignedAssets(assignedOnly);
    } catch (error) {
      console.error("Error fetching assigned assets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedAssets();
  }, []);

  
  const handleAssetReturned = async () => {
    setShowReturnModal(false);
    setSelectedAsset(null);
    await fetchAssignedAssets();
    if (refreshAssets) refreshAssets();
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
                    <small>Designation</small>
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
                    <small>Manufacturer</small>
                  </th>
                  <th>
                    <small>Return Request</small>
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
                      <small>{asset.designation || "-"}</small>
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
                      <small>{asset.manufacturer || "-"}</small>
                    </td>

                    <td className="d-flex justify-content-center gap-2">
                      {asset.status === "RETURN_PENDING" ? (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              setSelectedAsset({ ...asset, action: "accept" })
                            }
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              setSelectedAsset({ ...asset, action: "decline" })
                            }
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedAsset && (
              <ReturnActionPopup
                asset={selectedAsset}
                onClose={() => setSelectedAsset(null)}
                onUpdated={fetchAssignedAssets}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedList;
