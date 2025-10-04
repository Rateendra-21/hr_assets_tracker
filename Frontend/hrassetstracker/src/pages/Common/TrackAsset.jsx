import { useState, useRef } from "react";
import jsQR from "jsqr";
import { toast } from "react-hot-toast";
import {
  CameraIcon,
  Wrench,
  Trash2,
  User2,
  Undo2,
  WrapText,
  QrCodeIcon,
  Upload,
  LaptopMinimalCheck,
  Hammer,
  Shredder,
  Package,
  Check,
  CheckCircle,
  AlertCircle,
  CircleCheck,
  ToolCase,
  ClipboardCheck,
  CheckCircle2,
  ThumbsUp,
  XCircle,
  Clock,
  ThumbsDown
} from "lucide-react";
import Header from "../Common/Header";

const TrackAsset = () => {
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const [assetData, setAssetData] = useState(null);
  const [error, setError] = useState("");

  const fetchAssetData = async (qrId) => {
    if (!qrId) return;

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const token = userData?.access_token;

    if (!token) {
      toast.error("You are not logged in.");
      sessionStorage.removeItem("userData");
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/asset-lifecycle/timeline/qr/${encodeURIComponent(
          qrId
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (response.status === 404) {
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
        else toast.error("QR code not detected in the image");
      };
    };
    reader.readAsDataURL(file);
  };

  const handleCameraUpload = (e) => processImageFile(e.target.files[0]);
  const handleFileUpload = (e) => processImageFile(e.target.files[0]);

  const steps = [
    { label: "ALLOCATED" },
    { label: "ACCEPTED" },
    { label: "REPAIR_REQUESTED" },
    { label: "REJECTED" },
    { label: "RETURNED" },
    { label: "EWASTE" },
  ];

  const iconMap = {
    ALLOCATED: <CameraIcon size={20} />,
    ACCEPTED: <LaptopMinimalCheck size={20} />,
    REPAIR_REQUESTED: <Hammer size={20} />,
    REPAIR_APPROVED: <CircleCheck size={20} />,
    IN_REPAIR: <Wrench size={20} />,
    REPAIR_COMPLETED: <ThumbsUp size={20} />,
    REJECTED: <Trash2 size={20} />,
    RETURNED: <Undo2 size={20} />,
    EWASTE: <Shredder size={20} />,
  };

  return (
    <main className="flex-grow-1">
      <Header></Header>
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

      {/* look likes card  */}

      {/* {assetData && !error && (
        <div
          className="py-4 bg-light px-3 rounded shadow-sm mx-4 mt-4 text-light"
          style={{ maxHeight: 400, overflowY: "auto" }}
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
      )} */}

      {assetData && !error ? (
        <div
          className="p-4 bg-white rounded shadow mx-4 mt-4 custom-scroll"
          style={{ maxHeight: 400, overflowY: "auto" }}
        >
          <h5 className="mb-4 text-gradient fw-bold letter-spacing-1">
            Asset: {assetData.asset.asset_name}
          </h5>
          <div className="position-relative ps-3">
            <div
              className="timeline-connector position-absolute"
              style={{
                left: 32,
                top: 0,
                bottom: 0,
                width: 4,
                background:
                  "linear-gradient(to bottom, #303030ff 0%, #c5c5c5ff 100%)",
                borderRadius: 2,
                zIndex: 1,
              }}
            />
            {assetData.events && assetData.events.length ? (
              assetData.events.map((event) => {
                const iconProps = {
                  size: 16,
                  color: "white",
                  strokeWidth: 2,
                };

                let IconComponent;
                let bgColor;

                switch (event.event_type) {
                  case "AVAILABLE":
                    IconComponent = CircleCheck;
                    bgColor = "#28a745"; // green
                    break;

                  case "ASSIGNED":
                    IconComponent = User2;
                    bgColor = "#339af0"; // blue
                    break;

                  case "ALLOCATED":
                    IconComponent = Package;
                    bgColor = "#339af0"; // blue
                    break;

                  case "IN_REPAIR":
                    IconComponent = Wrench;
                    bgColor = "#ffc107"; // yellow
                    break;

                  case "REPAIRED":
                    IconComponent = CheckCircle;
                    bgColor = "#20c997"; // teal
                    break;

                  case "RETURN_PENDING":
                    IconComponent = Clock;
                    bgColor = "#fd7e14"; // orange
                    break;

                  case "RETURN_ACCEPTED":
                    IconComponent = ThumbsUp;
                    bgColor = "#198754"; // dark green
                    break;

                  case "RETURN_DECLINED":
                    IconComponent = ThumbsDown;
                    bgColor = "#dc3545"; // red
                    break;

                  case "REGISTERED":
                    IconComponent = PlusCircle;
                    bgColor = "#6c757d"; // gray
                    break;

                  case "REPAIR_REQUESTED":
                    IconComponent = AlertCircle;
                    bgColor = "#fd7e14"; // orange
                    break;

                  case "REPAIR_APPROVED":
                    IconComponent = CheckCircle2;
                    bgColor = "#0d6efd"; // blue
                    break;

                  case "REPAIR_COMPLETED":
                    IconComponent = ClipboardCheck;
                    bgColor = "#20c997"; // teal
                    break;

                  case "RETURNED":
                    IconComponent = Undo2;
                    bgColor = "#0dcaf0"; // cyan
                    break;

                  case "EWASTE":
                    IconComponent = Trash2;
                    bgColor = "#d81919ff"; // gray
                    break;

                  case "ACCEPTED":
                    IconComponent = Check;
                    bgColor = "#198754"; // dark green
                    break;

                  case "DECLINED":
                    IconComponent = X;
                    bgColor = "#dc3545"; // red
                    break;

                  case "REJECTED":
                    IconComponent = XCircle;
                    bgColor = "#dc3545"; // red
                    break;

                  case "PENDING":
                    IconComponent = Clock;
                    bgColor = "#ffc107"; // yellow
                    break;

                  case "APPROVED":
                    IconComponent = CheckCircle2;
                    bgColor = "#0d6efd"; // blue
                    break;

                  case "IN_PROGRESS":
                    IconComponent = Loader;
                    bgColor = "#0d6efd"; // blue
                    break;

                  case "COMPLETED":
                    IconComponent = CheckSquare;
                    bgColor = "#20c997"; // teal
                    break;

                  default:
                    IconComponent = WrapText;
                    bgColor = "#4895ef"; // fallback
                    break;
                }

                return (
                  <div key={event.id} className="d-flex mb-4 position-relative">
                    <span
                      className="timeline-dot d-flex justify-content-center align-items-center shadow"
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: bgColor,
                        // border: "2px solid black",
                        borderRadius: "50%",
                        // boxShadow: "0 0 8px rgba(34,139,230,0.12)",
                        zIndex: 2,
                        marginRight: 16,
                      }}
                    >
                      <IconComponent {...iconProps} />
                    </span>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <span
                          className="fw-semibold"
                          style={{
                            color: bgColor,
                            fontSize: "1.1rem",
                            letterSpacing: 0.3,
                          }}
                        >
                          {event.event_type}
                        </span>
                        <span className="small text-muted">
                          {new Date(event.event_date).toLocaleString()}
                        </span>
                      </div>
                      <div className="ms-2">
                        <div className="mb-1">
                          <strong>User:</strong> {event.user?.fullname || "N/A"}
                        </div>
                        <div
                          className="text-secondary"
                          style={{ fontSize: "0.95rem" }}
                        >
                          <strong>Remarks:</strong>{" "}
                          {event.remarks || "No remarks"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted py-4">
                No events for this asset.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-danger text-center p-4">
          {error ? error : "No data found."}
        </div>
      )}

      {/* {looks like timeline} */}
      {/* <div
        className="py-4 bg-light px-3 rounded shadow-sm mx-4 mt-4 text-light"
        style={{ maxHeight: 400, overflowY: "auto" }}
      >
        {assetData && !error && assetData.events.length > 0 && (
          <div
            style={{
              position: "relative",
              width: "100%",
              minHeight: 120,
              margin: "32px 0",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 20,
                left: "4%",
                right: "4%",
                height: 3,
                backgroundColor: "#1877f5",
                borderRadius: 3,
                zIndex: 0,
              }}
            />

            <div
              className="d-flex justify-content-between"
              style={{ position: "relative", zIndex: 1 }}
            >
              {assetData.events.map((event, idx) => (
                <div key={event.id} className="text-center" style={{ flex: 1 }}>
                  <div
                    className="bg-dark rounded-circle d-flex justify-content-center align-items-center mx-auto mb-2"
                    style={{
                      width: 40,
                      height: 40,
                      color: "#fff",
                      fontSize: 20,
                      boxShadow: "0 3px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    {iconMap[event.event_type] || <CameraIcon size={20} />}
                  </div>

                  <div className="fw-bold text-dark" style={{ fontSize: 12 }}>
                    {event.event_type.replace("_", " ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div> */}

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
