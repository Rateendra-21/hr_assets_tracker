import { useEffect, useState, useRef } from "react";
import ReturnAsset from "../Assets/ReturnAsset";
import RepairAsset from "../Assets/RepairAsset";

const EmployeeAsset = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  const [statusFilterByCat, setStatusFilterByCat] = useState("all");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showReturnPopup, setShowReturnPopup] = useState(false);
  const [showRepairPopup, setShowRepairPopup] = useState(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const employeeId = userData?.id;

    console.log("Employee ID from sessionStorage:", employeeId);

    if (!employeeId) {
      console.error("No employee_id found in sessionStorage");
      setLoading(false);
      return;
    }

    fetch(`http://127.0.0.1:8000/asset-allocations/assetbyempid/${employeeId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  const handleReturnClick = (asset) => {
    setSelectedAsset(asset);
    setShowReturnPopup(true);
  };

  const handleRepairClick = (asset) => {
    setSelectedAsset(asset);
    setShowRepairPopup(true);
  };

  const handleAssetUpdated = () => {
    // Refresh the asset list after an update
    fetchedRef.current = false;
    setLoading(true);
    
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const employeeId = userData?.id;
    
    fetch(`http://127.0.0.1:8000/asset-allocations/assetbyempid/${employeeId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  };

  if (loading) {
    return <p className="p-3">Loading assets...</p>;
  }

  return (
    <main className="flex-grow-1">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
        <h4 className="fw-bold" style={{ marginBottom: "12px" }}>
          My Asset
        </h4>
      </div>

      {/* Subtitle */}
      <div className="py-3 px-2 px-md-4" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="row align-items-center mb-3">
          <div className="col mb-2 mb-md-0">
            <h5 className="fw-bold mb-1">My Assets</h5>
            <span className="text-muted">
              View and manage your allocated company assets
            </span>
          </div>
        </div>
      </div>

      {/* Filter Dropdown */}
      <div
        className="p-2 py-3 mx-3 mt-4 rounded d-flex justify-content-end"
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
      <div
        className="p-2 py-3 mx-3 mt-4 rounded"
        style={{ border: "1px solid lightgrey" }}
      >
        <div className="container-fluid">
          {data.filter(
            (item) =>
              statusFilterByCat === "all" ||
              item.asset?.category === statusFilterByCat
          ).length === 0 ? (
            <div className="text-center py-5 rounded border">
              <small className="text-muted">No assigned assets found</small>
            </div>
          ) : (
            <div
              className="table-responsive custom-scroll"
              style={{
                maxHeight: "500px",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              <table
                className="table table-bordered mb-0 align-middle text-center"
                style={{ width: "max-content", minWidth: "100%" }}
              >
                <thead>
                  <tr>
                    <th>
                      <small>Sr. No</small>
                    </th>
                    <th>
                      <small>Allocated By</small>
                    </th>
                    <th>
                      <small>Asset Name</small>
                    </th>
                    <th>
                      <small>Category</small>
                    </th>
                    <th>
                      <small>Model</small>
                    </th>
                    <th>
                      <small>Serial No</small>
                    </th>
                    <th>
                      <small>Manufacturer</small>
                    </th>
                    <th>
                      <small>Location</small>
                    </th>
                    <th>
                      <small>Power Output</small>
                    </th>
                    <th>
                      <small>Connector Type</small>
                    </th>
                    <th>
                      <small>Cable Type</small>
                    </th>
                    <th>
                      <small>Action</small>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .filter(
                      (item) =>
                        statusFilterByCat === "all" ||
                        item.asset?.category === statusFilterByCat
                    )
                    .map((item, index) => (
                      <tr key={item.id || index}>
                        <td>
                          <small>{index + 1}</small>
                        </td>{" "}
                        {/* Serial Number */}
                        <td>
                          <small>{item.allocated_by || "-"}</small>
                        </td>
                        <td>
                          <small>{item.asset?.asset_name || "-"}</small>
                        </td>
                        <td>
                          <small>{item.asset?.category || "-"}</small>
                        </td>
                        <td>
                          <small>{item.asset?.model || "-"}</small>
                        </td>
                        <td>
                          <small>{item.asset?.serial_number || "-"}</small>
                        </td>
                        <td>
                          <small>{item.asset?.manufacturer || "-"}</small>
                        </td>
                        <td>
                          <small>
                            {item.asset?.location?.locationname || "-"}
                          </small>
                        </td>
                        <td>
                          <small>{item.asset?.power_output || "-"}</small>
                        </td>
                        <td>
                          <small>{item.asset?.connector_type || "-"}</small>
                        </td>
                        <td>
                          <small>{item.asset?.cable_type || "-"}</small>
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-center">
                            <button 
                              className="btn btn-dark btn-sm" 
                              onClick={() => handleReturnClick(item.asset)}
                            >
                              Return
                            </button>
                            <button 
                              className="btn btn-warning btn-sm" 
                              onClick={() => handleRepairClick(item.asset)}
                            >
                              Repair
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    {showReturnPopup && (
      <ReturnAsset
        asset={selectedAsset}
        onClose={() => setShowReturnPopup(false)}
        onAssetUpdated={handleAssetUpdated}
      />
    )}

    {showRepairPopup && (
      <RepairAsset
        asset={selectedAsset}
        onClose={() => setShowRepairPopup(false)}
        onAssetUpdated={handleAssetUpdated}
      />
    )}
    </main>
  );
};

export default EmployeeAsset;
