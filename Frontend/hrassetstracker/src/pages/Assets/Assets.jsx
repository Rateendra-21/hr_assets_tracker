import { useState } from "react";
import { Plus, Box } from "lucide-react";
import Assetlist from "./Assetlist";
import Addasset from "./Addasset";
import Header from "../Common/Header"

const Assets = () => {
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [reloadAssets, setReloadAssets] = useState(false);

  const openAddAssetModal = () => setShowAddAssetModal(true);
  const closeAddAssetModal = () => setShowAddAssetModal(false);

  const handleAssetSaved = () => {
    setReloadAssets((prev) => !prev);
    closeAddAssetModal();
  };

  return (
    <main className="flex-grow-1">
      {/* Header */}
  
      <Header></Header>

      {/* Management Section */}

      <div className="d-flex mx-4 mt-4 flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-2 rounded p-3 bg-light shadow-sm">
        {/* Left Section */}
        <div className="d-flex flex-column mb-2 mb-md-0">
          <h5 className="text-dark fw-bold mb-1">
            <Box size={17} className="me-2" />
            Asset Management
          </h5>
          <small className="text-muted">
            Register and manage company assets
          </small>
        </div>

        {/* Right Section */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-dark btn-sm d-flex align-items-center"
            onClick={openAddAssetModal}
          >
            <Plus size={16} className="me-2" />
            Register Assets
          </button>
        </div>
      </div>

      {/* Asset List */}
      <div className="px-1">
        <Assetlist reloadAssets={reloadAssets} />
      </div>

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Register New Asset</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeAddAssetModal}
                ></button>
              </div>
              <div className="modal-body">
                <Addasset
                  onClose={closeAddAssetModal}
                  onAssetSaved={handleAssetSaved}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Assets;
