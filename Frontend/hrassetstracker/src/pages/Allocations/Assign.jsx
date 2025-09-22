import { useState, useEffect } from "react";
import { Box, MapPin, UserRoundCheck } from "lucide-react";
import AssignAsset from "./AssignAsset";

const Assign = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

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
          <div className="col-12 col-md-6 d-flex justify-content-md-end">
            <div className="col-12 col-md-6">
              <label
                htmlFor="categoryFilter"
                className="form-label small fw-semibold text-dark"
              >
                Filter by Category
              </label>
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
          </div>
        </div>

        {/* Table */}
        <div
          className="table-responsive mt-4 custom-scroll"
          style={{ maxHeight: "300px" }}
        >
          <div className="border rounded p-3 w-100">
            {loading ? (
              <div className="text-center py-5">Loading assets...</div>
            ) : (
              <table className="table table-bordered align-middle mb-0 rounded">
                {/* <thead className="table-light">
                  <tr>
                    <th className="text-dark small bg-white fw-medium">
                      Asset Name
                    </th>
                    <th className="text-dark small bg-white fw-medium">
                      Category
                    </th>
                    <th className="text-dark small bg-white fw-medium">
                      Serial Number
                    </th>
                    <th className="text-dark small bg-white fw-medium">
                      Location
                    </th>
                    <th className="text-dark small bg-white fw-medium">
                      Manufacturer
                    </th>
                    <th className="text-dark small bg-white fw-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td className="text-dark small bg-white fw-medium">
                          {asset.asset_name || "-"}
                        </td>
                        <td className="text-dark small bg-white fw-medium">
                          <span className="badge bg-dark text-white border rounded-pill px-2 py-1">
                            {asset.category?.name || asset.category || "-"}
                          </span>
                        </td>
                        <td className="text-dark small bg-white fw-medium">
                          {asset.serial_number || "-"}
                        </td>
                        <td className="text-dark small bg-white fw-medium">
                          <MapPin size={14} className="me-2" />
                          {asset.location?.locationname ||
                            asset.location ||
                            "-"}
                        </td>
                        <td className="text-dark small bg-white fw-medium">
                          {asset.manufacturer?.manufacturer ||
                            asset.manufacturer ||
                            "-"}
                        </td>
                        <td className="text-dark small bg-white fw-medium">
                          <button
                            className="btn btn-dark btn-sm d-flex align-items-center gap-2"
                            onClick={() => handleAssignClick(asset)}
                          >
                            <UserRoundCheck size={15} />
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center text-dark small bg-white fw-medium"
                      >
                        No assets found
                      </td>
                    </tr>
                  )}
                </tbody> */}
              </table>
            )}
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
