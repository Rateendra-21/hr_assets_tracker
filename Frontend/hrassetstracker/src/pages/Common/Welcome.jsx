import { useRef, useState } from "react";
import jsQR from "jsqr";
import { useNavigate } from "react-router-dom";
import { Laptop2, QrCode } from "lucide-react";
import { toast } from "react-hot-toast";
import AssetLifecycleModal from "./AssetLifecycleModal"; // make sure path is correct

const Welcome = () => {
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [showModal, setShowModal] = useState(false);
  const [assetData, setAssetData] = useState(null);

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleScan = () => {
    cameraInputRef.current.click();
  };

  // Process image and extract QR code
  const processImageFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const code = jsQR(
          ctx.getImageData(0, 0, canvas.width, canvas.height).data,
          canvas.width,
          canvas.height
        );

        if (code) {
          const qrId = code.data.trim();
          // toast.success(`QR Detected: ${qrId}`);
          console.log("QR Detected:", qrId);

          try {
            const res = await fetch(`${baseUrl}/asset-lifecycle/trackassetby/${qrId}`);
            if (!res.ok) {
              toast.error("Asset not found!");
              return;
            }
            const data = await res.json();
            console.log("Asset Data:", data);

            setAssetData(data);
            setShowModal(true);

          } catch (error) {
            console.error("Error fetching asset data:", error);
            toast.error("Failed to fetch asset data");
          }
        } else {
          toast.error("QR code not detected");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="d-flex vh-100 align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #0029ddff, #67b5ffff)",
      }}
    >
      <div
        className="card p-4 text-center shadow-lg"
        style={{ maxWidth: "450px", width: "100%", borderRadius: "50px" }}
      >
        <div className="text-center mb-4">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#f0f0f0",
            }}
          >
            <Laptop2 className="text-dark" size={36} />
          </div>
          <h2 className="h4 mb-2">Welcome to HR Asset Tracker</h2>
          <p className="text-muted mb-3">
            Manage and track your organization’s assets easily and securely.
          </p>
        </div>

        {/* Buttons Section */}
        <div className="d-flex gap-3 justify-content-center">
          <button
            onClick={handleSignIn}
            className="btn btn-dark flex-fill"
            style={{
              borderRadius: "30px",
              padding: "10px 0",
              fontWeight: "500",
            }}
          >
            Sign In
          </button>

          <button
            onClick={handleScan}
            className="btn btn-outline-dark flex-fill d-flex align-items-center justify-content-center gap-2"
            style={{
              borderRadius: "30px",
              padding: "10px 0",
              fontWeight: "500",
            }}
          >
            <QrCode size={18} />
            Track Asset
          </button>

          {/* Hidden Camera Input */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => processImageFile(e.target.files[0])}
          />
        </div>
      </div>

      {/* Asset Lifecycle Modal */}
      {showModal && assetData && (
        <AssetLifecycleModal
          data={assetData}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Welcome;
