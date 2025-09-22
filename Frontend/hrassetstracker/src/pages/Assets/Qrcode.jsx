import React from "react";
import QRCode from "react-qr-code";

const Qrcode = ({ show, onClose, asset }) => {
  if (!show || !asset) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ maxWidth: "400px" }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Asset QR Code</h5>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body text-center">
              <div className="mb-2"
                style={{
                  display: "inline-block",
                  padding: "25px",
                  backgroundColor: "white",
                  border: "2px solid #F3F4F6",
                  borderRadius: "10px",
                }}
              >
                <QRCode
                  value={asset.qr_id || "No QR ID"}
                  size={170}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <p style={{ margin: "4px 0" }}>
                <small style={{ fontWeight: "600", fontSize: "16px" }}>
                  Asset Name :
                </small>{" "}
                {asset.asset_name}
              </p>

              <p style={{ margin: "4px 0" }}>
                <small style={{ fontWeight: "600", fontSize: "16px" }}>
                  Asset Category :
                </small>{" "}
                {asset.category}
              </p>

              <p style={{ margin: "4px 0" }}>
                <small style={{ fontWeight: "600", fontSize: "16px" }}>
                  Asset Manufacturer :
                </small>{" "}
                {asset.manufacturer}
              </p>

              <p style={{ margin: "4px 0" }}>
                <small style={{ fontWeight: "600", fontSize: "16px" }}>
                  Location :
                </small>{" "}
                {asset.location?.locationname || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
};

export default Qrcode;
