import { useState } from "react";
import { Plus } from "lucide-react";
import Assetlist from "./Assetlist";
import Addasset from "./Addasset";

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
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <h4 className="fw-bold" style={{ marginBottom: "12px" }}>
          Asset
        </h4>
      </div>

      {/* Management Section */}
      <div className="py-4 px-4" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="row align-items-center mb-3">
          <div className="col-12 col-md-6 mb-2 mb-md-0">
            <h5 className="fw-bold mb-1">Asset Management</h5>
            <span className="text-muted d-block">
              Register and manage company assets
            </span>
          </div>
          <div className="col-12 col-md-6 d-flex justify-content-md-end gap-2">
            <button
              className="btn btn-dark d-flex align-items-center w-auto w-md-auto"
              onClick={openAddAssetModal}
            >
              <Plus size={18} className="me-2" />
              Register Assets
            </button>
          </div>
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
