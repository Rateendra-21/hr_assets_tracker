import { useState, useRef } from "react";
import jsQR from "jsqr";
import { toast } from "react-hot-toast";
import {
  CameraIcon,
  Wrench,
  Trash2,
  Undo2,
  WrapText,
  QrCodeIcon,
  Upload,
  LaptopMinimalCheck,
  Check,
  CheckCircle,
  AlertCircle,
  CircleCheck,
  ClipboardCheck,
  CheckCircle2,
  ThumbsUp,
  XCircle,
  Clock,
  ThumbsDown,
  Package,
} from "lucide-react";
import Header from "../Common/Header";

const eventTypeIconMap = {
  REGISTERED: { Icon: LaptopMinimalCheck, color: "#2fad2fff" },
  AVAILABLE: { Icon: CircleCheck, color: "#28a745" },
  ALLOCATED: { Icon: Package, color: "#339af0" },
  ACCEPTED: { Icon: Check, color: "#198754" },
  DECLINED: { Icon: XCircle, color: "#dc3545" },
  REPAIR_REQUESTED: { Icon: AlertCircle, color: "#fd7e14" },
  REPAIR_APPROVED: { Icon: CheckCircle2, color: "#0d6efd" },
  IN_REPAIR: { Icon: Wrench, color: "#ffc107" },
  REPAIR_COMPLETED: { Icon: ClipboardCheck, color: "#20c997" },
  RETURN_PENDING: { Icon: Clock, color: "#fd7e14" },
  RETURN_DECLINED: { Icon: ThumbsDown, color: "#dc3545" },
  RETURN_ACCEPTED: { Icon: ThumbsUp, color: "#198754" },
  RETURNED: { Icon: Undo2, color: "#0dcaf0" },
  EWASTE: { Icon: Trash2, color: "#d81919ff" },
  DEFAULT: { Icon: WrapText, color: "#4895ef" },
};

const userLabelMap = {
  REGISTERED: "Registered by",
  ALLOCATED: "Allocated by",
  ACCEPTED: "Accepted by",
  DECLINED: "Declined by",
  REPAIR_REQUESTED: "Requested by",
  REPAIR_APPROVED: "Approved by",
  IN_REPAIR: "Sent to repair by",
  REPAIR_COMPLETED: "Completed by",
  RETURN_PENDING: "Requested return by",
  RETURN_DECLINED: "Return declined by",
  RETURN_ACCEPTED: "Return accepted by",
  EWASTE: "Marked Ewaste by",
};

const eventLabelMap = {
  REGISTERED: "Asset Registered",
  ALLOCATED: "Asset Allocated",
  ACCEPTED: "Asset Accepted",
  DECLINED: "Asset Declined",
  REPAIR_REQUESTED: "Repair Requested",
  REPAIR_APPROVED: "Repair Approved",
  IN_REPAIR: "In Repair",
  REPAIR_COMPLETED: "Repair Completed",
  RETURN_PENDING: "Return Request - Pending",
  RETURN_DECLINED: "Return Rejected",
  RETURN_ACCEPTED: "Return Accepted",
  RETURNED: "Returned",
  EWASTE: "Marked as Ewaste",
};

const getUserLabel = (eventType) => userLabelMap[eventType] || "Performed by";
const getEventLabel = (eventType) => eventLabelMap[eventType] || eventType;


const convertEventsToCSV = (groupedEvents) => {
  const headers = [
    "Allocation Cycle",
    "Event",
    "Date & Time",
    "User",
    "Role",
    "Remarks",
  ];
  const rows = [];

  groupedEvents.forEach((group, index) => {
    const cycleNum = `Allocation Cycle ${index + 1}`;
    group.forEach((event) => {
      rows.push([
        `"${cycleNum}"`,
        `"${getEventLabel(event.event_type)}"`,
        `"${new Date(event.event_date).toLocaleString()}"`,
        `"${event.user?.fullname || "N/A"}"`,
        `"${event.user?.role || "N/A"}"`,
        `"${event.remarks ? event.remarks.replace(/"/g, '""') : "No remarks"}"`,
      ]);
    });
  });

  return [headers, ...rows].map((r) => r.join(",")).join("\r\n");
};

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const groupByAllocationCycles = (events) => {
  if (!events?.length) return [];

  const registeredEvent = events.find((e) => e.event_type === "REGISTERED");
  if (!registeredEvent) return []; 

  const groups = [];
  let currentGroup = [];

 
  let hasAllocated = false;

  events.forEach((event) => {
    if (event.event_type === "REGISTERED") return; 
    if (event.event_type === "ALLOCATED") {

      if (currentGroup.length) groups.push(currentGroup);
      currentGroup = [registeredEvent, event];
      hasAllocated = true;
    } else {
      currentGroup.push(event);
    }
  });

  if (!hasAllocated) groups.push([registeredEvent]);
  else if (currentGroup.length) groups.push(currentGroup);

  return groups;
};

const TrackAsset = () => {
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [assetData, setAssetData] = useState(null);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState("All");

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
      const res = await fetch(
        `http://127.0.0.1:8000/asset-lifecycle/timeline/qr/${encodeURIComponent(qrId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 404) {
        toast.error("No data found for this QR code");
        setAssetData(null);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAssetData(data);
    } catch {
      toast.error("Failed to fetch asset data");
      setAssetData(null);
    }
  };

  const processImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const code = jsQR(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height);
        code ? fetchAssetData(code.data) : toast.error("QR code not detected");
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadReport = () => {
    if (!assetData?.events?.length) return toast.error("No data to download");
    const grouped = groupByAllocationCycles(assetData.events);

    // Filter cycles by employee selection
    const filteredGrouped = selectedUser === "All"
      ? grouped
      : grouped.filter((cycle) => cycle.some((e) => e.user?.fullname === selectedUser));

    const csv = convertEventsToCSV(filteredGrouped);
    const name = `asset_${assetData.asset.asset_name.replace(/\s+/g, "_")}_report.csv`;
    downloadCSV(csv, name);
  };

  const employeeUsers =
    assetData?.events
      ?.map((e) => e.user)
      .filter((u) => u?.role?.toLowerCase() === "employee")
      .filter((v, i, a) => a.findIndex((x) => x.fullname === v.fullname) === i)
      .map((u) => u.fullname) || [];

  const filteredCycles =
    selectedUser === "All"
      ? groupByAllocationCycles(assetData?.events)
      : groupByAllocationCycles(assetData?.events).filter((cycle) =>
          cycle.some((event) => event.user?.fullname === selectedUser)
        );

  return (
    <main className="flex-grow-1">
      <Header />

      {/* Header */}
      <div className="d-flex mx-4 mt-3 flex-column flex-md-row align-items-start justify-content-between p-3 bg-light shadow-sm rounded">
        <div>
          <h5 className="fw-bold mb-1 text-dark">
            <QrCodeIcon className="me-2 mb-1" /> Track Asset
          </h5>
          <small className="text-muted">Scan or upload a QR to view asset timeline</small>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <button className="btn btn-dark btn-sm d-flex align-items-center" onClick={() => cameraInputRef.current.click()}>
            <CameraIcon size={16} className="me-2" /> Open Camera
          </button>
          <button className="btn btn-dark btn-sm d-flex align-items-center" onClick={() => uploadInputRef.current.click()}>
            <Upload size={16} className="me-2" /> Upload File
          </button>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => processImageFile(e.target.files[0])} />
          <input ref={uploadInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => processImageFile(e.target.files[0])} />
        </div>
      </div>

      {assetData?.events?.length > 0 && (
        <div className="rounded border mx-4 mt-2 py-3 px-3 bg-light text-dark d-flex justify-content-between align-items-center">
          {employeeUsers.length > 0 && (
            <div className="d-flex align-items-center">
              <label htmlFor="employeeFilter" className="me-2"><small>Filter by Employee:</small></label>
              <select id="employeeFilter" className="form-select form-select-sm w-auto" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="All">All Employees</option>
                {employeeUsers.map((user) => (<option key={user} value={user}>{user}</option>))}
              </select>
            </div>
          )}
          <button className="btn btn-primary btn-sm" onClick={handleDownloadReport}>Download Report</button>
        </div>
      )}

      {/* Timeline */}
      {assetData && !error && (
        <div className="p-4 bg-white rounded shadow mx-4 mt-3 custom-scroll" style={{ maxHeight: 360, overflowY: "auto" }}>
          <h5 className="fw-bold mb-4 text-gradient">Asset: {assetData.asset.asset_name}</h5>

          {filteredCycles.map((group, i) => (
            <div key={i} className="position-relative mb-4">
              <div className="text-primary fw-semibold position-absolute" style={{ right: 0, top: -30, fontSize: "0.9rem", background: "#fff", padding: "0 8px" }}>
                Allocation Cycle {i + 1}
              </div>

              <div className="position-relative ps-3">
                <div className="timeline-connector position-absolute animated-line" style={{ left: 32, top: 0, width: 4, zIndex: 1, borderRadius: 2 }} />
                {group.map((event) => {
                  const { Icon, color: bg } = eventTypeIconMap[event.event_type] || eventTypeIconMap.DEFAULT;
                  return (
                    <div key={event.id} className="d-flex mb-3 position-relative">
                      <span className="timeline-dot d-flex justify-content-center align-items-center shadow" style={{ width: 36, height: 36, backgroundColor: bg, borderRadius: "50%", zIndex: 2, marginRight: 16 }}>
                        <Icon size={16} color="white" strokeWidth={2} />
                      </span>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-semibold" style={{ color: bg }}>{getEventLabel(event.event_type)}</span>
                          <span className="small text-muted">{new Date(event.event_date).toLocaleString()}</span>
                        </div>
                        <div className="ms-2">
                          <div>
                            <strong>{getUserLabel(event.event_type)}:</strong> {event.user?.fullname || "N/A"} <small className="text-muted">({event.user?.role || "N/A"})</small>
                          </div>
                          <div className="text-secondary" style={{ fontSize: "0.95rem" }}>
                            <strong>Remarks:</strong> {event.remarks || "No remarks"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <hr style={{ borderTop: "2px dashed #ccc", margin: "10px 0" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .animated-line {
          background: linear-gradient(to bottom, #303030 0%, #c5c5c5 100%);
          height: 0;
          animation: growLine 2s forwards;
        }
        @keyframes growLine {
          to { height: 100%; }
        }
      `}</style>
    </main>
  );
};


export default TrackAsset;
