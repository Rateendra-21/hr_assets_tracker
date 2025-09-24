import { useState, useEffect } from "react";
import { Edit, Eye, QrCode, Trash2, LayoutGrid, Table } from "lucide-react";
import Qrcode from "./Qrcode";
import AssetDetails from "./AssetDetails";
import EditAsset from "./EditAsset";
import EwasteAsset from "./EwasteAsset";

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
      const res = await fetch(
        `http://127.0.0.1:8000/assets/update/${updatedAsset.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAsset),
        }
      );
      const data = await res.json();
      setAssets((prev) => prev.map((a) => (a.id === data.id ? data : a)));
      handleCloseEdit();
    } catch (err) {
      console.error("Error updating asset:", err);
    }
  };

  const fetchAssets = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/assets/getAllAssets")
      .then((res) => res.json())
      .then((data) => {
        setAssets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching assets:", err);
        setLoading(false);
      });
  };

  // Fetch assets on mount or when reloadAssets changes
  useEffect(() => {
    fetchAssets();
  }, [reloadAssets]);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      asset.model.toLowerCase().includes(search.toLowerCase()) ||
      asset.serial_number.toLowerCase().includes(search.toLowerCase());

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

  return (
    <div className="container mt-3">
      {/* Search & Filter */}

      <div
        className="py-3 px-3 mb-3 row g-2"
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
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="e-waste">e-waste</option>
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
          className="w-100 custom-scroll py-3"
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
                            asset.status === "available"
                              ? "bg-success"
                              : asset.status === "assigned"
                              ? "bg-dark"
                              : "bg-danger"
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

                        {asset.status === "available" && (
                          <button
                            className="btn btn-dark btn-sm"
                            onClick={() => handleEditClick(asset)}
                          >
                            <Edit size={15} className="mb-1" />
                          </button>
                        )}

                        {asset.status !== "e-waste" && (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleEwasteClick(asset)}
                          >
                            e-waste <Trash2 size={17} className="mb-1" />
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

      <div style={{ display: viewMode === "table" ? "block" : "none" }}>
        <div className="py-2 rounded" style={{ border: "1px solid lightgrey" }}>
          <div className="container-fluid">
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
                  maxHeight: "500px",
                  overflowY: "scroll",
                  overflowX: "scroll",
                }}
              >
                <table
                  className="table table-bordered table-hover mb-0 align-middle text-center"
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
                          <small>
                            <span
                              className={`badge ${
                                asset.status === "available"
                                  ? "bg-success"
                                  : asset.status === "assigned"
                                  ? "bg-dark"
                                  : "bg-danger"
                              }`}
                            >
                              {asset.status}
                            </span>
                          </small>
                        </td>
                        <td className="d-flex justify-content-center flex-wrap gap-1">
                          <button
                            className="btn btn-dark btn-sm d-flex align-items-center"
                            onClick={() => handleQrClick(asset)}
                          >
                            <QrCode size={14} />
                            {/* <small>QR</small> */}
                          </button>

                          <button
                            className="btn btn-dark btn-sm"
                            onClick={() => handleViewClick(asset)}
                          >
                            <Eye size={14} />
                          </button>

                          {asset.status === "available" && (
                            <button
                              className="btn btn-dark btn-sm"
                              onClick={() => handleEditClick(asset)}
                            >
                              <Edit size={14} />
                            </button>
                          )}

                          {asset.status !== "e-waste" && (
                            <button
                              className="btn btn-danger btn-sm d-flex align-items-center"
                              onClick={() => handleEwasteClick(asset)}
                            >
                              {/* <small className="me-1"></small> */}
                              <Trash2 size={14} />
                            </button>
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
      </div>

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
