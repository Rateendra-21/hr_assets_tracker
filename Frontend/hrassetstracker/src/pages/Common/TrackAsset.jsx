import { useState, useRef } from "react";
import { CameraIcon, UploadIcon } from "lucide-react";
import jsQR from "jsqr";

const TrackAsset = () => {
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const [assetData, setAssetData] = useState(null);
  const [error, setError] = useState("");

  // Fetch asset data from API
  const fetchAssetData = async (id) => {
    if (!id) return;
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/assets/trackAssetByqr/${encodeURIComponent(
          id
        )}`
      );
      const data = await response.json();
      setAssetData(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch asset data");
      setAssetData(null);
    }
  };

  // Common function to process uploaded image (camera or gallery)
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

        if (code) {
          fetchAssetData(code.data);
        } else {
          setError("QR code not detected in the image");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Handlers
  const handleCameraUpload = (e) => {
    const file = e.target.files[0];
    processImageFile(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    processImageFile(file);
  };

  return (

       <main className="flex-grow-1">
  
      <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
        <h4 className="fw-bold" style={{marginBottom:"12px"}}>Track Asset</h4>
      </div>

 
      <div className="py-3 px-2 px-md-4" >
        <div className="row align-items-center mb-3">
        
          <div className="container py-4">
      <div className="shadow-sm">
        <div className="card-body">

          {/* Camera and Upload Icons */}
          <div className="row g-3 mb-4 justify-content-center">
            {/* Camera */}
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

                {/* Hidden camera input */}
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

            {/* Upload */}
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
          </div>

          {/* Display fetched asset data */}
          {assetData && (
            <div className="alert alert-success">
              <pre>{JSON.stringify(assetData, null, 2)}</pre>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
        </div>
      </div>
    </div>
        </div>
      </div>

      
    </main>



    
  );
};

export default TrackAsset;
