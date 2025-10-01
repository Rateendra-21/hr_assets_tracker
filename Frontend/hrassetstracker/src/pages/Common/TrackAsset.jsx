import { useState, useRef } from "react";
import { CameraIcon, QrCodeIcon, Upload, UploadIcon } from "lucide-react";
import jsQR from "jsqr";
import { toast } from "react-hot-toast";


const TrackAsset = () => {
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const [assetData, setAssetData] = useState(null);
  const [error, setError] = useState("");


  const fetchAssetData = async (qrId) => {
  if (!qrId) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/asset-lifecycle/timeline/qr/${encodeURIComponent(qrId)}`
    );

    if (response.status === 404) {
      // Show toast for no data
      toast.error("No data found for this QR code");
      setAssetData(null);
      setError("");
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch asset data");
    }

    const data = await response.json();
    setAssetData(data);
    setError("");
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch asset data");
    setAssetData(null);
    setError("");
  }
};

  const processImageFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) fetchAssetData(code.data);
        else toast.error("QR code not detected in the image")
        // else setError("QR code not detected in the image");
      };
    };
    reader.readAsDataURL(file);
  };

  const handleCameraUpload = (e) => processImageFile(e.target.files[0]);
  const handleFileUpload = (e) => processImageFile(e.target.files[0]);

  return (
    <main className="flex-grow-1">
      <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
        <h4 className="fw-bold" style={{ marginBottom: "12px" }}>
          Track Asset
        </h4>
      </div>

      {/* <div className="row g-3 mb-2 py-4 px-4">
        <div className="col-12 col-md-6">
          <div
            onClick={() => cameraInputRef.current.click()}
            className="d-flex flex-column align-items-center justify-content-center rounded bg-white text-center p-4"
            style={{
              border: "2px dotted black",
              cursor: "pointer",
              minHeight: "200px",
            }}
          >
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                padding: "10px",
                backgroundColor: "black",
              }}
            >
              <CameraIcon size={30} className="text-light" />
            </div>

            <h5 className="mb-1 text-dark mt-2">Open Camera</h5>
            <small className="text-muted">
              Take photo using your device camera
            </small>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>

      
        <div className="col-12 col-md-6">
          <div
            onClick={() => uploadInputRef.current.click()}
            className="d-flex flex-column align-items-center justify-content-center rounded bg-white text-center p-4"
            style={{
              border: "2px dotted black",
              cursor: "pointer",
              minHeight: "200px",
            }}
          >
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                padding: "10px",
                backgroundColor: "black",
              }}
            >
              <UploadIcon size={30} className="text-light" />
            </div>

            <h5 className="mb-1 text-dark mt-2">Upload File</h5>
            <small className="text-muted">
              Select image from device storage
            </small>

            
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>
        </div>
      </div> */}

      <div className="d-flex mx-4 mt-4 flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-2 rounded p-3 bg-light shadow-sm">
        {/* Left Section */}
        <div className="d-flex flex-column mb-2 mb-md-0">
          <h5 className="text-dark fw-bold mb-1">
            {/* Optional icon */}
            <QrCodeIcon className="me-2 mb-1" />
            Track Assset
          </h5>
          <small className="text-muted">
            Track your asset by scanning qr code
          </small>
        </div>

        {/* Right Section */}

        <div className="d-flex gap-2">
          <button
            className="btn btn-dark btn-sm d-flex align-items-center"
            onClick={() => cameraInputRef.current.click()}
          >
            <CameraIcon size={16} className="me-2" />
            Open Camera
          </button>

          <button
            className="btn btn-dark btn-sm d-flex align-items-center"
            onClick={() => uploadInputRef.current.click()}
          >
            <Upload size={16} className="me-2" />
            Upload File
          </button>

          {/* Hidden camera input */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraUpload}
            style={{ display: "none" }}
          />

          {/* Hidden upload input */}
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {assetData && !error && (
        <div
          className="py-3 rounded shadow-sm mx-4"
          style={{ maxHeight: 300, overflowY: "auto" }}
        >
          <h5 className="mb-4 text-primary fw-semibold">
            Asset: {assetData.asset.asset_name}
          </h5>
          <div className="timeline">
            {assetData.events.map((event) => (
              <div
                key={event.id}
                className="timeline-item mb-4 p-3 bg-white rounded shadow-sm"
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="fw-bold fs-5 text-dark">
                    {event.event_type}
                  </div>
                  <div className="text-muted small">
                    {new Date(event.event_date).toLocaleString()}
                  </div>
                </div>
                <div
                  className="ms-2 text-secondary"
                  style={{ fontSize: "0.9rem" }}
                >
                  <div>User: {event.user?.fullname || "N/A"}</div>
                  <div>Remarks: {event.remarks || "No remarks"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && !assetData && (
        <span
          className="text-danger fw-medium mx-4"
          style={{ fontSize: "0.9rem" }}
        >
          {error}
        </span>
      )}
    </main>
  );
};

export default TrackAsset;
