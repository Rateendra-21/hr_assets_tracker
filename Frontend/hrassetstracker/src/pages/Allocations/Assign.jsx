import { useState, useEffect } from "react";
import { Box, MapPin, LayoutGrid, Table, Check } from "lucide-react";
import AssignAsset from "./AssignAsset";
const Assign = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [viewMode, setViewMode] = useState("grid");

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

  // Filter assets by category
  const filteredAssets =
    categoryFilter === "all"
      ? assets
      : assets.filter(
          (a) => (a.category?.name || a.category) === categoryFilter
        );

  const handleAssetSelect = (asset) => {
    setSelectedAssets((prev) => {
      const isSelected = prev.some((a) => a.id === asset.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== asset.id);
      } else {
        return [...prev, asset];
      }
    });
  };

  const handleAssignClick = () => {
    if (selectedAssets.length === 0) {
      alert("Please select at least one asset to assign");
      return;
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

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
    <main className="flex-grow-1 mt-3">
      <div
        className="p-3"
        style={{ border: "1px solid lightgrey", borderRadius: "8px" }}
      >
        <div>
          <div className="d-flex flex-column">
            <h5 className="text-dark d-flex align-items-center mb-1 m-0">
              <Box className="me-2 text-muted" size={20} />
              Allocations
            </h5>
            <small className="text-muted">
              Select assets using checkboxes and assign them to an employee
            </small>
          </div>

          <div className="row mt-3 align-items-center">
            {/* Category Filter */}
            <div className="col-12 col-md-3 mb-2 mb-md-0">
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
                className={`btn btn-dark btn-sm ${
                  viewMode === "grid" ? "" : "opacity-75"
                }`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                className={`btn btn-dark btn-sm ms-2 ${
                  viewMode === "table" ? "" : "opacity-75"
                }`}
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
      </div>

      {/* Asset List with Checkboxes */}
      <div className="mt-1">
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
            <div className="d-flex justify-content-between mb-3">
              <h6></h6>
            </div>

            <div style={{ display: viewMode === "grid" ? "block" : "none" }}>
              <div
                className="w-100 custom-scroll py-3"
                style={{
                  maxWidth: "1100px",
                  maxHeight: "330px",
                  paddingRight: "10px",
                }}
              >
                {filteredAssets.length === 0 ? (
                  <div
                    className="text-center py-5 rounded"
                    style={{ border: "1px solid lightgrey" }}
                  >
                    <span className="text-muted">No assets found</span>
                  </div>
                ) : (
                  <div className="row g-3">
                    {filteredAssets.map((asset, index) => (
                      <div
                        className="col-12 col-sm-6 col-lg-4"
                        key={asset.id || index}
                      >
                        <div
                          className={`card h-100 shadow-sm border rounded-3 ${
                            selectedAssets.some((a) => a.id === asset.id)
                              ? "border-primary"
                              : ""
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleAssetSelect(asset)}
                        >
                          <div className="card-body d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
                              <div>
                                <h5
                                  className="card-title mb-1"
                                  style={{ fontSize: "1rem" }}
                                >
                                  {asset.asset_name}
                                </h5>
                                <h6
                                  className="card-subtitle text-muted"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {asset.category || "-"}
                                </h6>
                              </div>

                              <div className="d-flex align-items-center gap-3 mt-1 mt-md-0">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    style={{
                                      border: "1px solid black",
                                      cursor: "pointer",
                                    }}
                                    type="checkbox"
                                    checked={selectedAssets.some(
                                      (a) => a.id === asset.id
                                    )}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleAssetSelect(asset);
                                    }}
                                    id={`asset-${asset.id}`}
                                    // style={{ cursor: "pointer" }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="row mb-3">
                              <div className="col-6 mb-2 mb-md-0">
                                <small className="text-muted">Location</small>
                                <p
                                  className="mb-1"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {asset.location?.locationname || "-"}
                                </p>
                              </div>
                              <div className="col-6 mb-2 mb-md-0">
                                <small className="text-muted">
                                  Registered Date
                                </small>
                                <p
                                  className="mb-1"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {asset.register_date
                                    ? new Date(
                                        asset.register_date
                                      ).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "-"}
                                </p>
                              </div>

                              <div className="col-6 mb-2 mb-md-0">
                                <small className="text-muted">
                                  Manufacturer
                                </small>
                                <p
                                  className="mb-1"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {asset.manufacturer || "-"}
                                </p>
                              </div>

                              <div className="col-6 mb-2 mb-md-0">
                                <small className="text-muted">
                                  Manufacturer
                                </small>
                                <p
                                  className="mb-1"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {asset.status || "-"}
                                </p>
                              </div>
                            </div>

                            {/* Add other info or actions here if needed */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: viewMode === "table" ? "block" : "none" }}>
              <div
                className="shadow rounded"
                style={{ border: "1px solid lightgrey" }}
              >
                <div className="container-fluid p-0">
                  {filteredAssets.length === 0 ? (
                    <div
                      className="text-center py-5 rounded"
                      style={{ border: "1px solid lightgrey" }}
                    >
                      <span className="text-muted">No assets found</span>
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
                        <thead className="table">
                          <tr>
                            <th>
                              <small>Select</small>
                            </th>
                            <th>
                              <small>Asset Name</small>
                            </th>
                            <th>
                              <small>Category</small>
                            </th>
                            <th>
                              <small>Location</small>
                            </th>
                            <th>
                              <small>Registered Date</small>
                            </th>
                            <th>
                              <small>Manufacturer</small>
                            </th>
                            <th>
                              <small>Status</small>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAssets.map((asset, index) => {
                            const formattedDate = asset.register_date
                              ? new Date(
                                  asset.register_date
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-";
                            return (
                              <tr
                                key={asset.id || index}
                                className={
                                  selectedAssets.some((a) => a.id === asset.id)
                                    ? "table-primary"
                                    : ""
                                }
                                style={{ cursor: "pointer" }}
                                onClick={() => handleAssetSelect(asset)}
                              >
                                <td className="d-flex justify-content-center align-items-center">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input "
                                      style={{ border: "1px solid black" }}
                                      type="checkbox"
                                      checked={selectedAssets.some(
                                        (a) => a.id === asset.id
                                      )}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={() => handleAssetSelect(asset)}
                                      id={`asset-table-${asset.id}`}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <small>{asset.asset_name}</small>
                                </td>
                                <td>
                                  <small>{asset.category || "-"}</small>
                                </td>
                                <td>
                                  <small>
                                    {asset.location?.locationname || "-"}
                                  </small>
                                </td>
                                <td>
                                  <small>{formattedDate}</small>
                                </td>
                                <td>
                                  <small>{asset.manufacturer || "-"}</small>
                                </td>
                                <td>
                                  <small>{asset.status}</small>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Assign Modal */}
      {showModal && (
        <AssignAsset
          assets={selectedAssets}
          onClose={handleModalClose}
          onSave={handleSave}
          onRemove={(assetId) => {
            setSelectedAssets((prev) => prev.filter((a) => a.id !== assetId));
          }}
        />
      )}
    </main>
  );
};

export default Assign;
