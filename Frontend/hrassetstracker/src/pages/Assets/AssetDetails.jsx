import React from "react";

const AssetDetails = ({ show, onClose, asset }) => {
  if (!show || !asset) return null;

  // Helper to show value or '-' if empty
  const displayValue = (value) => (value ? value : "-");

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "700px" }}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Asset Details</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {/* First row */}
              <div className="row g-3">
                <div className="col-md-4">
                  <small className="text-muted">Name</small>
                  <div><strong style={{ fontWeight: 500 }}>{displayValue(asset.asset_name)}</strong></div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Category</small>
                  <div><strong style={{ fontWeight: 500 }}>{displayValue(asset.category)}</strong></div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Manufacturer</small>
                  <div><strong style={{ fontWeight: 500 }}>{displayValue(asset.manufacturer)}</strong></div>
                </div>
              </div>

              {/* Second row */}
              <div className="row g-3 mt-2">
                <div className="col-md-4">
                  <small className="text-muted">Location</small>
                  <div><strong style={{ fontWeight: 500 }}>{displayValue(asset.location?.locationname)}</strong></div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Status</small>
                  <div><strong style={{ fontWeight: 500 }}>{displayValue(asset.status)}</strong></div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted">Model</small>
                  <div><strong style={{ fontWeight: 500 }}>{displayValue(asset.model)}</strong></div>
                </div>
              </div>

              {/* Third row */}
              <div className="row g-3 mt-2">
                <div className="col-md-4">
                  <small className="text-muted">Serial Number</small>
                  <div><strong style={{ fontWeight: 500 }}>{displayValue(asset.serial_number)}</strong></div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">Specification</small>
                  <div><strong style={{ fontWeight: 500 }}>{displayValue(asset.specification)}</strong></div>
                </div>

                {/* Display Remarks only if status is e-waste */}
                {asset.status === "e-waste" && (
                  <div className="col-md-12 mt-2">
                    <small className="text-muted">Remarks</small>
                    <div><strong style={{ fontWeight: 500 }}>{displayValue(asset.remarks)}</strong></div>
                  </div>
                )}
              </div>

              {/* Close button aligned to right */}
              <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-dark" onClick={onClose}>Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
};

export default AssetDetails;
