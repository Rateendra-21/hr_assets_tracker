import { useState, useEffect } from "react";
import { Box, MapPin, LayoutGrid, Table } from "lucide-react";
import AssignAsset from "./AssignAsset";
const Assign = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
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

  const handleAssignClick = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAsset(null);
  };

  const handleSave = async (employeeName) => {
    if (!selectedAsset) return;

    try {
      // Example API request for assigning asset
      await fetch("http://127.0.0.1:8000/assets/assignAsset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: selectedAsset.id,
          employeeName,
        }),
      });

      handleModalClose();
      fetchAssets(); // refresh after save
    } catch (err) {
      console.error("Error assigning asset:", err);
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
              Select a category to view available assets and assign them to
              employees
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

      {/* Assign Modal */}
      {showModal && (
        <AssignAsset
          asset={selectedAsset}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </main>
  );
};

export default Assign;
