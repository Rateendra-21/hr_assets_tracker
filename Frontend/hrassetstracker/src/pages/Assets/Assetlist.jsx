import { useState, useEffect } from "react";
import {
  Edit,
  Eye,
  QrCode,
  Trash2,
  LayoutGrid,
  Table,
  RotateCcw,
  User2,
  User2Icon,
  Wrench,
  Shredder,
} from "lucide-react";
import Qrcode from "./Qrcode";
import AssetDetails from "./AssetDetails";
import EditAsset from "./EditAsset";
import EwasteAsset from "./EwasteAsset";
import RepairAsset from "./RepairAsset";
import ReturnAsset from "./ReturnAsset";
import { toast } from "react-hot-toast";

const AssetList = ({ reloadAssets }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusFilterByCat, setStatusFilterByCat] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showEwastePopup, setShowEwastePopup] = useState(false);
  const [showRepairPopup, setShowRepairPopup] = useState(false);
  const [showReturnPopup, setShowReturnPopup] = useState(false);
  
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const handleQrClick = (asset) => {
    setSelectedAsset(asset);
    setShowQrPopup(true);
  };

  const handleViewClick = (asset) => {
    setSelectedAsset(asset);
    setShowDetailsPopup(true);
  };

  const handleEditClick = (asset) => {
    setSelectedAsset(asset);
    setShowEditPopup(true);
  };

  const handleCloseEdit = () => {
    setShowEditPopup(false);
    setSelectedAsset(null);
  };

  const handleSaveEdit = (updatedAsset) => {
    setAssets((prevAssets) =>
      prevAssets.map((a) => (a.id === updatedAsset.id ? updatedAsset : a))
    );
  };

  const handleUpdateAsset = async (updatedAsset) => {
    try {
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const token = userData?.access_token;
      if (!token) {
        toast.error("You are not logged in.");
        setLoading(false);
        return;
      }
      const res = await fetch(
        `${baseUrl}/assets/update/${updatedAsset.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedAsset),
        }
      );
      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setAssets((prev) => prev.map((a) => (a.id === data.id ? data : a)));
      handleCloseEdit();
    } catch (err) {
      console.error("Error updating asset:", err);
    }
  };

  const fetchAssets = async () => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const token = userData?.access_token;

    if (!token) {
      toast.error("You are not logged in.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/assets/getAllAssets`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to fetch assets");
      }

      const data = await res.json();
      setAssets(data); 
    } catch (err) {
      console.error("Error fetching assets:", err);
      toast.error(err.message || "Something went wrong while fetching assets.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch assets on mount or when reloadAssets changes
  useEffect(() => {
    fetchAssets();
  }, [reloadAssets]);

  const filteredAssets = assets.filter((asset) => {
    const searchLower = search.toLowerCase();

    const matchesSearch =
      asset.asset_name?.toLowerCase().includes(searchLower) ||
      "" ||
      asset.model?.toLowerCase().includes(searchLower) ||
      "" ||
      asset.serial_number?.toLowerCase().includes(searchLower) ||
      "";

    const matchesStatus =
      statusFilter === "all" || asset.status === statusFilter;

    const matchesCategory =
      statusFilterByCat === "all" || asset.category === statusFilterByCat;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleEwasteClick = (asset) => {
    setSelectedAsset(asset);
    setShowEwastePopup(true);
  };

  const handleRepairClick = (asset) => {
    setSelectedAsset(asset);
    setShowRepairPopup(true);
  };

  const handleReturnClick = (asset) => {
    setSelectedAsset(asset);
    setShowReturnPopup(true);
  };

  return (
    <div className="container mt-3">
      {/* Search & Filter */}

      <div
        className="py-3 mx-2 px-3 mb-3 mt-2 row g-2"
        style={{ border: "1px solid lightgrey", borderRadius: "8px" }}
      >
        {/* Search Input */}
        <div className="col-12 col-md-7">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control form-control-sm w-100"
            placeholder="Search assets by name, ID, or type..."
          />
        </div>

        {/* Status Filter */}
        <div className="col-12 col-md-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select form-select-sm w-100"
          >
            <option value="all">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_REPAIR">In Repair</option>
            <option value="EWASTE">e-waste</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="col-8 col-md-2">
          <select
            value={statusFilterByCat}
            onChange={(e) => setStatusFilterByCat(e.target.value)}
            className="form-select form-select-sm w-100"
          >
            <option value="all">All Category</option>
            <option value="Laptop">Laptop</option>
            <option value="Desktop">Desktop</option>
            <option value="Mouse">Mouse</option>
            <option value="Charger">Charger</option>
          </select>
        </div>

        <div className="col-4 col-md-1 d-flex justify-content-end">
          <button
            className="btn btn-dark btn-sm mb-2 mx-1"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={14} className="" />
          </button>

          <button
            className="btn btn-dark btn-sm mb-2 mx-1"
            onClick={() => setViewMode("table")}
          >
            <Table size={14} className="" />
          </button>
        </div>
      </div>

      <div style={{ display: viewMode === "grid" ? "block" : "none" }}>
        {/* Asset Cards */}
        <div
          className="w-100 custom-scroll py-3 mx-2"
          style={{
            maxWidth: "1100px",
            maxHeight: "330px",
            paddingRight: "10px",
          }}
        >
          {loading ? (
            <div className="text-center py-5">
              <span className="text-muted">Loading assets...</span>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div
              className="text-center py-5 rounded"
              style={{ border: "1px solid lightgrey" }}
            >
              <span className="text-muted">No assets found</span>
            </div>
          ) : (
            <div className="row g-4">
              {filteredAssets.map((asset) => (
                <div className="col-md-6" key={asset.id}>
                  <div className="card h-100 shadow-sm border rounded-3">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-1">{asset.asset_name}</h5>
                        <span
                          className={`badge ${
                            asset.status === "AVAILABLE"
                              ? "bg-success" // green
                              : asset.status === "ASSIGNED"
                              ? "bg-dark" // black
                              : asset.status === "IN_REPAIR"
                              ? "bg-warning" // yellow
                              : asset.status === "EWASTE"
                              ? "bg-danger" // red
                              : "bg-secondary" // fallback color for any other status
                          } rounded-pill`}
                        >
                          {asset.status}
                        </span>
                      </div>

                      <div className="row mb-4">
                        <div className="col-6">
                          <small className="text-muted">Category</small>
                          <p className="mb-1">{asset.category || "-"}</p>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Manufacturer</small>
                          <p className="mb-1">{asset.manufacturer || "-"}</p>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Location</small>
                          <p className="mb-1">
                            {asset.location?.locationname || "-"}
                          </p>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Status</small>
                          <p className="mb-1">{asset.status}</p>
                        </div>
                      </div>

                      <div className="mt-auto d-flex justify-content-end flex-wrap gap-2">
                        {/* {asset.status === "AVAILABLE" && (
                          <button
                            className="btn btn-warning btn-sm d-flex align-items-center"
                            onClick={() => handleRepairClick(asset)}
                            title="Send for Repair"
                          >
                            <Wrench size={14} />
                          </button>
                        )} */}

                        <button
                          className="btn btn-outline-dark btn-sm d-flex align-items-center"
                          onClick={() => handleQrClick(asset)}
                        >
                          <QrCode className="me-1" size={15} />
                          QR Code
                        </button>

                        <button
                          className="btn btn-dark btn-sm"
                          onClick={() => handleViewClick(asset)}
                        >
                          <Eye size={15} className="mb-1" />
                        </button>

                        {asset.status === "AVAILABLE" && (
                          <button
                            className="btn btn-dark btn-sm"
                            onClick={() => handleEditClick(asset)}
                          >
                            <Edit size={15} className="mb-1" />
                          </button>
                        )}

                        {[
                          "AVAILABLE",
                          "IN_REPAIR",
                          "REPAIR_REQUESTED",
                        ].includes(asset.status) && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleEwasteClick(asset)}
                          >
                            e-waste <Shredder size={17} className="mb-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewMode === "table" && (
        <div
          className="shadow rounded mx-2"
          style={{ border: "1px solid lightgrey" }}
        >
          <div className="container-fluid p-0">
            {loading ? (
              <div className="text-center py-5">
                <small className="text-muted">Loading assets...</small>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div
                className="text-center py-5 rounded"
                style={{ border: "1px solid lightgrey" }}
              >
                <small className="text-muted">No assets found</small>
              </div>
            ) : (
              <div
                className="table-responsive custom-scroll"
                style={{
                  maxHeight: "300px",
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
                        <small>Asset Name</small>
                      </th>
                      <th>
                        <small>Category</small>
                      </th>
                      <th>
                        <small>Manufacturer</small>
                      </th>
                      <th>
                        <small>Location</small>
                      </th>
                      <th>
                        <small>Status</small>
                      </th>
                      <th>
                        <small>Actions</small>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td>
                          <small>{asset.asset_name}</small>
                        </td>
                        <td>
                          <small>{asset.category || "-"}</small>
                        </td>
                        <td>
                          <small>{asset.manufacturer || "-"}</small>
                        </td>
                        <td>
                          <small>{asset.location?.locationname || "-"}</small>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              asset.status === "AVAILABLE"
                                ? "bg-success"
                                : asset.status === "ASSIGNED"
                                ? "bg-dark"
                                : asset.status === "REPAIR"
                                ? "bg-warning"
                                : asset.status === "E-WASTE"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            <small>{asset.status}</small>
                          </span>
                        </td>

                        <td className="d-flex justify-content-center gap-1 flex-wrap">
                          {/* {asset.status === "AVAILABLE" && (
                            <span
                              className="badge bg-warning text-dark d-flex align-items-center"
                              style={{ cursor: "pointer" }}
                              title="Send for Repair"
                              onClick={() => handleRepairClick(asset)}
                            >
                              <Wrench size={14} color="black" />
                            </span>
                          )} */}

                          <span
                            className="badge bg-dark d-flex align-items-center"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleQrClick(asset)}
                            title="QR Code"
                          >
                            <QrCode size={14} />
                          </span>

                          <span
                            className="badge bg-dark d-flex align-items-center"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleViewClick(asset)}
                            title="View"
                          >
                            <Eye size={14} />
                          </span>

                          {asset.status === "AVAILABLE" && (
                            <span
                              className="badge bg-dark d-flex align-items-center"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleEditClick(asset)}
                              title="Edit"
                            >
                              <Edit size={14} />
                            </span>
                          )}

                          {[
                            "AVAILABLE",
                            "IN_REPAIR",
                            "REPAIR_REQUESTED",
                          ].includes(asset.status) && (
                            <span
                              className="badge bg-danger d-flex align-items-center"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleEwasteClick(asset)}
                              title="Send to E-Waste"
                            >
                              <Shredder size={14} />
                            </span>
                          )}
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

      {/* Modals */}
      {selectedAsset && showQrPopup && (
        <Qrcode
          show={showQrPopup}
          onClose={() => setShowQrPopup(false)}
          asset={selectedAsset}
        />
      )}

      {selectedAsset && showDetailsPopup && (
        <AssetDetails
          show={showDetailsPopup}
          onClose={() => setShowDetailsPopup(false)}
          asset={selectedAsset}
        />
      )}

      {selectedAsset && showEditPopup && (
        <EditAsset
          asset={selectedAsset}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}

      {selectedAsset && showEwastePopup && (
        <EwasteAsset
          asset={selectedAsset}
          onClose={() => setShowEwastePopup(false)}
          onUpdated={fetchAssets}
        />
      )}

      {selectedAsset && showRepairPopup && (
        <RepairAsset
          asset={selectedAsset}
          onClose={() => {
            setShowRepairPopup(false);
            setSelectedAsset(null);
          }}
          onUpdated={() => {
            fetchAssets();
            setShowRepairPopup(false);
            setSelectedAsset(null);
          }}
        />
      )}

      {selectedAsset && showReturnPopup && (
        <ReturnAsset
          asset={selectedAsset}
          onClose={() => setShowReturnPopup(false)}
          onUpdated={fetchAssets}
        />
      )}

      {selectedAsset && showEwastePopup && (
        <EwasteAsset
          asset={selectedAsset}
          onClose={() => setShowEwastePopup(false)}
          onUpdated={() => {
            setShowEwastePopup(false);
            fetchAssets();
          }}
        />
      )}
    </div>
  );
};

export default AssetList;
