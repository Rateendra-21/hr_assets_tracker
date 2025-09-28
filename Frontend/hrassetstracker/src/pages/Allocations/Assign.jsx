import { useState, useEffect } from "react";
import { Box, LayoutGrid, Table } from "lucide-react";
import AssignAsset from "./AssignAsset";
import Assignedlist from "./Assignedlist";

const Assign = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [activeView, setActiveView] = useState("assigned"); // 'assigned' or 'assign'

  // Fetch all assets from backend
  const fetchAssets = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/assets/getAllAssets")
      .then((res) => res.json())
      .then((data) => {
        const availableAssets = data.filter((a) => a.status === "AVAILABLE");
        setAssets(availableAssets);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching assets:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Filter assets based on selected category
  const filteredAssets =
    categoryFilter === "all"
      ? assets
      : assets.filter((a) => (a.category?.name || a.category) === categoryFilter);

  // Handle selection of assets
  const handleAssetSelect = (asset) => {
    setSelectedAssets((prev) => {
      const isSelected = prev.some((a) => a.id === asset.id);
      return isSelected ? prev.filter((a) => a.id !== asset.id) : [...prev, asset];
    });
  };

  // Open modal to assign assets
  const handleAssignClick = () => {
    if (selectedAssets.length === 0) {
      alert("Please select at least one asset to assign");
      return;
    }
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleSave = async (employeeId) => {
    if (selectedAssets.length === 0) return;
    try {
      fetchAssets();
      setSelectedAssets([]);
      handleModalClose();
    } catch (err) {
      console.error("Error assigning assets:", err);
    }
  };

  return (
    <main className="flex-grow-1">
      {/* Header with toggle buttons */}
      <div className="d-flex align-items-center justify-content-between mb-2 rounded p-3 bg-light">
        <div className="d-flex flex-column">
          <h5 className="text-dark d-flex align-items-center">
            <Box className="me-2 text-muted" size={20} />
            Allocations
          </h5>
          <small className="text-muted">
            Select assets using checkboxes and assign them to an employee
          </small>
        </div>

        <div>
          <div className="btn-group" role="group" aria-label="View toggle">
            <button
              type="button"
              className={`btn btn-sm rounded-start ${
                activeView === "assigned" ? "btn-dark text-white" : "btn-outline-dark"
              }`}
              onClick={() => setActiveView("assigned")}
            >
              Assigned Asset
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-end ${
                activeView === "assign" ? "btn-dark text-white" : "btn-outline-dark"
              }`}
              onClick={() => setActiveView("assign")}
            >
              Assign Asset
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Assets View */}
      {activeView === "assigned" && (
        <div className="p-3 border rounded bg-white mb-2">
          <Assignedlist refreshAssets={fetchAssets} />
        </div>
      )}

      {/* Assign Assets View */}
      {activeView === "assign" && (
        <>
          <div className="p-3 border rounded bg-white mb-2 mt-4">
            <div className="row align-items-center">
              {/* Category Filter */}
              <div className="col-12 col-md-3 mb-md-0">
                <select
                  id="categoryFilter"
                  className="form-select form-select-sm w-100"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Category</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Mouse">Mouse</option>
                  <option value="Charger">Charger</option>
                </select>
              </div>

              {/* View Mode Buttons */}
              <div className="col-12 col-md-2 mb-2 mb-md-0 d-flex align-items-center">
                <button
                  className={`btn btn-dark btn-sm ${viewMode === "grid" ? "" : "opacity-75"}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid View"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  className={`btn btn-dark btn-sm ms-2 ${viewMode === "table" ? "" : "opacity-75"}`}
                  onClick={() => setViewMode("table")}
                  aria-label="Table View"
                >
                  <Table size={14} />
                </button>
              </div>

              {/* Assign Button */}
              <div className="col-12 col-md-7 d-flex justify-content-md-end">
                <button
                  className="btn btn-dark btn-sm"
                  onClick={handleAssignClick}
                  disabled={selectedAssets.length === 0}
                >
                  Assign Selected Assets ({selectedAssets.length})
                </button>
              </div>
            </div>
          </div>

          {/* Asset List */}
          <div>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No available assets found</p>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === "grid" && (
                  <div
                    className="w-100 custom-scroll py-2"
                    style={{ maxWidth: "1100px", maxHeight: "330px", paddingRight: "10px" }}
                  >
                    <div className="row g-3">
                      {filteredAssets.map((asset) => (
                        <div className="col-12 col-sm-6 col-lg-4" key={asset.id}>
                          <div
                            className={`card h-100 shadow-sm border rounded-3 ${
                              selectedAssets.some((a) => a.id === asset.id) ? "border-primary" : ""
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleAssetSelect(asset)}
                          >
                            <div className="card-body d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
                                <div>
                                  <h5 className="card-title mb-1" style={{ fontSize: "1rem" }}>
                                    {asset.asset_name}
                                  </h5>
                                  <h6 className="card-subtitle text-muted" style={{ fontSize: "0.85rem" }}>
                                    {asset.category || "-"}
                                  </h6>
                                </div>

                                <div className="d-flex align-items-center gap-3 mt-1 mt-md-0">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      style={{ border: "1px solid black", cursor: "pointer", height: "20px", width: "20px" }}
                                      type="checkbox"
                                      checked={selectedAssets.some((a) => a.id === asset.id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleAssetSelect(asset);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Add more asset info here */}
                              <div className="row mb-3">
                                <div className="col-6">
                                  <small className="text-muted">Location</small>
                                  <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                                    {asset.location?.locationname || "-"}
                                  </p>
                                </div>
                                <div className="col-6">
                                  <small className="text-muted">Registered Date</small>
                                  <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                                    {asset.register_date
                                      ? new Date(asset.register_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                                      : "-"}
                                  </p>
                                </div>
                                <div className="col-6">
                                  <small className="text-muted">Manufacturer</small>
                                  <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                                    {asset.manufacturer || "-"}
                                  </p>
                                </div>
                                <div className="col-6">
                                  <small className="text-muted">Status</small>
                                  <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                                    {asset.status || "-"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Table View */}

                  {viewMode === "table" && (
  <div className="shadow rounded" style={{ border: "1px solid lightgrey" }}>
    <div
      className="table-responsive custom-scroll"
      style={{ maxHeight: "500px", overflow: "auto", padding: "20px" }}
    >

        <table className="table table-sm mb-0 align-middle text-center">
  <thead >
    <tr>
      <th><small>Select</small></th>
      <th><small>Asset Name</small></th>
      <th><small>Category</small></th>
      <th><small>Location</small></th>
      <th><small>Registered Date</small></th>
      <th><small>Manufacturer</small></th>
      <th><small>Status</small></th>
    </tr>
  </thead>
  <tbody>
    {filteredAssets.map((asset) => {
      const formattedDate = asset.register_date
        ? new Date(asset.register_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-";
      const isSelected = selectedAssets.some((a) => a.id === asset.id);

      return (
        <tr
          key={asset.id}
          className={isSelected ? "table-primary" : ""}
          style={{ cursor: "pointer" }}
          onClick={() => handleAssetSelect(asset)}
        >
          <td className="text-center">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isSelected}
              onChange={() => handleAssetSelect(asset)}
              onClick={(e) => e.stopPropagation()}
              style={{ transform: "scale(0.9)" }} // shrink checkbox slightly
            />
          </td>
          <td><small>{asset.asset_name}</small></td>
          <td><small>{asset.category || "-"}</small></td>
          <td><small>{asset.location?.locationname || "-"}</small></td>
          <td><small>{formattedDate}</small></td>
          <td><small>{asset.manufacturer || "-"}</small></td>
          <td><small>{asset.status || "-"}</small></td>
        </tr>
      );
    })}
  </tbody>
</table>



    </div>
  </div>
)}



              </>
            )}
          </div>
        </>
      )}

      {/* Assign Asset Modal */}
      {showModal && (
        <AssignAsset
          assets={selectedAssets}
          onClose={handleModalClose}
          onSave={handleSave}
          onRemove={(assetId) => setSelectedAssets((prev) => prev.filter((a) => a.id !== assetId))}
        />
      )}
    </main>
  );
};

export default Assign;
