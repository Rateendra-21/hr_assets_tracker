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
        const availableAssets = data.filter((a) => a.status === "available");
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
    setSelectedAssets(prev => {
      const isSelected = prev.some(a => a.id === asset.id);
      if (isSelected) {
        return prev.filter(a => a.id !== asset.id);
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
      // Will be implemented in the AssignAsset component
      fetchAssets(); // refresh after save
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
        <div className="row align-items-start mb-2">
          {/* Left Column */}
          <div className="col-12 col-md-6 mb-2 mb-md-0">
            <h5 className="text-dark d-flex align-items-center mb-1">
              <Box className="me-2 text-muted" size={20} />
              Allocations
            </h5>
            <small className="text-muted d-block">
              Select assets using checkboxes and assign them to an employee
            </small>
          </div>

          {/* Right Column */}
          <div className="col-12 col-md-6 d-flex justify-content-md-end mt-3">
            <div className="col-9 col-md-4">
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

            <div className="col-3 col-md-2">
              <button
                className="btn btn-dark btn-sm mb-2 mx-1"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid size={14} className="" />
              </button>

              <button
                className="btn btn-dark btn-sm mb-2"
                onClick={() => setViewMode("table")}
              >
                <Table size={14} className="" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Asset List with Checkboxes */}
      <div className="mt-3">
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
              <h6>{filteredAssets.length} available assets</h6>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleAssignClick}
                disabled={selectedAssets.length === 0}
              >
                Assign Selected Assets ({selectedAssets.length})
              </button>
            </div>
            
            {viewMode === "grid" ? (
              <div className="row g-3">
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className="col-md-4 col-lg-3">
                    <div 
                      className={`card h-100 ${selectedAssets.some(a => a.id === asset.id) ? 'border-primary' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <div className="card-body">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedAssets.some(a => a.id === asset.id)}
                            onChange={() => handleAssetSelect(asset)}
                            id={`asset-${asset.id}`}
                          />
                          <label className="form-check-label" htmlFor={`asset-${asset.id}`}>
                            <h6 className="card-title">{asset.asset_name}</h6>
                          </label>
                        </div>
                        <p className="card-text small">
                          <strong>Category:</strong> {asset.category?.name || asset.category || "-"}
                          <br />
                          <strong>Serial:</strong> {asset.serial_number || "-"}
                          <br />
                          <strong>Location:</strong> {asset.location?.locationname || asset.location || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Asset Name</th>
                      <th>Category</th>
                      <th>Serial Number</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset) => (
                      <tr 
                        key={asset.id}
                        className={selectedAssets.some(a => a.id === asset.id) ? 'table-primary' : ''}
                      >
                        <td>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedAssets.some(a => a.id === asset.id)}
                              onChange={() => handleAssetSelect(asset)}
                              id={`asset-table-${asset.id}`}
                            />
                          </div>
                        </td>
                        <td>{asset.asset_name}</td>
                        <td>{asset.category?.name || asset.category || "-"}</td>
                        <td>{asset.serial_number || "-"}</td>
                        <td>{asset.location?.locationname || asset.location || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Assign Modal */}
      {showModal && (
        <AssignAsset
          assets={selectedAssets}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </main>
  );
};

export default Assign;
