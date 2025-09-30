import { useEffect, useState, useRef } from "react";
import RepairAsset from "../Assets/RepairAsset";
import DeclineAssetPopup from "./DeclineAssetPopup"; 
import { toast } from "react-hot-toast";
import { Folder } from "lucide-react";


const EmployeeAsset = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showRepairPopup, setShowRepairPopup] = useState(false);
  const [showDeclinePopup, setShowDeclinePopup] = useState(false);
  const [statusFilterByCat, setStatusFilterByCat] = useState("all");
  const fetchedRef = useRef(false);

  const employeeId = JSON.parse(sessionStorage.getItem("userData"))?.user?.id;

  const fetchAssignedAssets = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/assigned/${employeeId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const result = await res.json();
      const filteredData = result.filter((asset) => asset.status !== "EWASTE");
      setData(filteredData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchAssignedAssets();
    }
  }, []);

  const handleRepairClick = (asset) => {
    setSelectedAsset(asset);
    setShowRepairPopup(true);
  };

  const handleAcceptClick = async (item) => {
    const payload = {
      allocation_id: item.allocation_id,
      action: "accept",
      user_id: employeeId,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/allocation/action", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to accept asset");

      toast.success("Asset accepted successfully!");
      fetchAssignedAssets();
    } catch (error) {
      toast.error("Error accepting asset: " + error.message);
    }
  };

  const handleDeclineClick = (item) => {
    setSelectedAsset(item);
    setShowDeclinePopup(true);
  };

  const submitDecline = async (remarks) => {
    if (!remarks.trim()) {
      toast.error("Please enter remarks for decline.");
      return;
    }

    const payload = {
      allocation_id: selectedAsset.allocation_id,
      action: "decline",
      user_id: employeeId,
      remarks,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/allocation/action", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to decline asset");

      setShowDeclinePopup(false);
      fetchAssignedAssets();
      toast.success("Asset declined successfully!");
    } catch (error) {
      toast.error("Error declining asset: " + error.message);
    }
  };

  const handleAssetUpdated = () => {
    fetchAssignedAssets();
    setShowRepairPopup(false);
  };

  if (loading) {
    return <p className="p-3">Loading assets...</p>;
  }

  const filteredData = data.filter(
    (item) => statusFilterByCat === "all" || item.category === statusFilterByCat
  );

  return (
    <main className="flex-grow-1">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
        <h4 className="fw-bold " style={{ marginBottom: "13px" }}>
          My Assets
        </h4>
      </div>

      {/* Subtitle */}
      <div className="d-flex mx-4 mt-4 flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-2 rounded p-3 bg-light shadow-sm">
  {/* Left Section */}
  <div className="d-flex flex-column mb-2 mb-md-0">
    <h5 className="text-dark fw-bold mb-1">
      <Folder size={17} className="me-2" />
      My Assets
    </h5>
    <small className="text-muted">
      View and manage your allocated company assets
    </small>
  </div>
</div>

      {/* Filter Dropdown */}
      <div
        className="p-2 mx-4 py-3 mt-4 rounded d-flex justify-content-end"
        style={{ border: "1px solid lightgrey" }}
      >
        <div className="col-md-3">
          <select
            value={statusFilterByCat}
            onChange={(e) => setStatusFilterByCat(e.target.value)}
            className="form-select form-select-sm"
          >
            <option value="all">All Category</option>
            <option value="Laptop">Laptop</option>
            <option value="Desktop">Desktop</option>
            <option value="Mouse">Mouse</option>
            <option value="Charger">Charger</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="py-4 px-1 mx-3 rounded">
        <div
          className="shadow rounded"
          style={{ border: "1px solid lightgrey" }}
        >
          <div className="container-fluid p-0">
            <div
              className="table-responsive custom-scroll"
              style={{
                maxHeight: "500px",
                overflowY: "auto",
                overflowX: "auto",
                padding: filteredData.length > 0 ? "20px" : "0px",
              }}
            >
              <table
                className="table mb-0 align-middle text-center"
                style={{ width: "100%", minWidth: "1200px" }}
              >
                <thead className="table">
                  <tr>
                    <th>
                      <small>Sr. No</small>
                    </th>
                    <th>
                      <small>Asset Name</small>
                    </th>
                    <th>
                      <small>Category</small>
                    </th>
                    <th>
                      <small>Allocation Date</small>
                    </th>
                    <th>
                      <small>Manufacturer</small>
                    </th>
                    <th>
                      <small>Allocated By</small>
                    </th>
                    <th>
                      <small>Status</small>
                    </th>
                    <th>
                      <small>Action</small>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-5">
                        <span className="text-muted">
                          No assigned assets found
                        </span>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => {
                      const allocationDate = item.allocation_date
                        ? new Date(item.allocation_date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-";

                      return (
                        <tr key={item.allocation_id || index}>
                          <td>
                            <small>{index + 1}</small>
                          </td>
                          <td>
                            <small>{item.asset_name || "-"}</small>
                          </td>
                          <td>
                            <small>{item.category || "-"}</small>
                          </td>
                          <td>
                            <small>{allocationDate}</small>
                          </td>
                          <td>
                            <small>{item.manufacturer || "-"}</small>
                          </td>
                          <td>
                            <small>{item.allocated_by_name || "-"}</small>
                          </td>
                          <td>
                            <small>{item.status}</small>
                          </td>
                          <td className="d-flex justify-content-center gap-2">
                            {item.status === "ASSIGNED" ? (
                              <span
                                className="badge bg-dark text-light"
                                style={{
                                  cursor: "pointer",
                                  padding: "0.5em 0.8em",
                                  fontSize: "0.85em",
                                }}
                                onClick={() => handleRepairClick(item)}
                              >
                                <small>Report Repair</small>
                              </span>
                            ) : item.status === "ALLOCATED" ? (
                              <>
                                <span
                                  className="badge bg-success text-light"
                                  style={{
                                    cursor: "pointer",
                                    padding: "0.4em 0.8em",
                                    fontSize: "0.85em",
                                  }}
                                  onClick={() => handleAcceptClick(item)}
                                  title="Accept"
                                >
                                  <small>✓</small>
                                </span>
                                <span
                                  className="badge bg-danger text-light"
                                  style={{
                                    cursor: "pointer",
                                    padding: "0.4em 0.8em",
                                    fontSize: "0.85em",
                                  }}
                                  onClick={() => handleDeclineClick(item)}
                                  title="Decline"
                                >
                                  <small>✗</small>
                                </span>
                              </>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Repair Asset Popup */}
      {showRepairPopup && (
        <RepairAsset
          asset={selectedAsset}
          onClose={() => setShowRepairPopup(false)}
          onUpdated={handleAssetUpdated}
        />
      )}

      {/* Decline Asset Popup */}
      {showDeclinePopup && (
        <DeclineAssetPopup
          show={showDeclinePopup}
          onClose={() => setShowDeclinePopup(false)}
          onSubmit={submitDecline}
          asset={selectedAsset}
        />
      )}
    </main>
  );
};

export default EmployeeAsset;
