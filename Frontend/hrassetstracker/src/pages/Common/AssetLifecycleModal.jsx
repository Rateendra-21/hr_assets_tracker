import React, { useEffect, useState } from "react";
import {
  LaptopMinimalCheck,
  CircleCheck,
  Package,
  Check,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Wrench,
  ClipboardCheck,
  Clock,
  ThumbsDown,
  ThumbsUp,
  Undo2,
  Trash2,
  WrapText,
} from "lucide-react";

// ---------------------- Icon & Label Maps ----------------------
const eventTypeIconMap = {
  REGISTERED: { Icon: LaptopMinimalCheck, color: "#2fad2fff" },
  AVAILABLE: { Icon: CircleCheck, color: "#28a745" },
  ALLOCATED: { Icon: Package, color: "#339af0" },
  ACCEPTED: { Icon: Check, color: "#198754" },
  DECLINED: { Icon: XCircle, color: "#dc3545" },
  REPAIR_REQUESTED: { Icon: AlertCircle, color: "#fd7e14" },
  REPAIR_APPROVED: { Icon: CheckCircle2, color: "#0d6efd" },
  IN_REPAIR: { Icon: Wrench, color: "#ffc107" },
  REPAIR_COMPLETED: { Icon: ClipboardCheck, color: "#00a775ff" },
  RETURN_PENDING: { Icon: Clock, color: "#fd7e14" },
  RETURN_DECLINED: { Icon: ThumbsDown, color: "#dc3545" },
  RETURN_ACCEPTED: { Icon: ThumbsUp, color: "#198754" },
  RETURNED: { Icon: Undo2, color: "#0dcaf0" },
  EWASTE: { Icon: Trash2, color: "#d81919ff" },
  REJECTED: { Icon: ThumbsDown, color: "#167d8fff" },
  IN_INVENTORY: { Icon: CircleCheck, color: "#20c997" },
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
  RETURNED: "Returned by",
  EWASTE: "Marked Ewaste by",
  REJECTED: "Repair rejected by",
  IN_INVENTORY: "Updated by",
};

const eventLabelMap = {
  REGISTERED: "Asset Registered",
  ALLOCATED: "Asset Allocated",
  ACCEPTED: "Asset Accepted",
  DECLINED: "Asset Declined",
  REPAIR_REQUESTED: "Repair Requested",
  REPAIR_APPROVED: "Repair Approved",
  REJECTED: "Repair Rejected",
  IN_REPAIR: "In Repair",
  REPAIR_COMPLETED: "Repair Completed",
  RETURN_PENDING: "Return Request - Pending",
  RETURN_DECLINED: "Return Rejected",
  RETURN_ACCEPTED: "Return Accepted",
  RETURNED: "Returned",
  EWASTE: "Marked as Ewaste",
  IN_INVENTORY: "Asset at Inventory",
};

const getUserLabel = (eventType) => userLabelMap[eventType] || "Performed by";
const getEventLabel = (eventType) => eventLabelMap[eventType] || eventType;

// ---------------------- Group Events ----------------------
const groupByAllocationCycles = (events) => {
  if (!events?.length) return [];
  const registeredEvent = events.find((e) => e.event_type === "REGISTERED");
  if (!registeredEvent) return [];

  const groups = [];
  let currentGroup = [];
  let hasAllocated = false;
  let cycleCounter = 1;

  events.forEach((event) => {
    if (event.event_type === "REGISTERED") return;

    if (event.event_type === "ALLOCATED") {
      if (currentGroup.length)
        groups.push({ cycleNumber: cycleCounter++, events: currentGroup });
      currentGroup = [registeredEvent, event];
      hasAllocated = true;
    } else {
      currentGroup.push(event);
    }
  });

  if (!hasAllocated)
    groups.push({ cycleNumber: cycleCounter++, events: [registeredEvent] });
  else if (currentGroup.length)
    groups.push({ cycleNumber: cycleCounter++, events: currentGroup });

  // Add IN_INVENTORY after RETURN_ACCEPTED
  groups.forEach((group) => {
    const lastEvent = group.events[group.events.length - 1];
    if (lastEvent?.event_type === "RETURN_ACCEPTED") {
      group.events.push({
        id: `inventory-${lastEvent.id}`,
        event_type: "IN_INVENTORY",
        event_date: lastEvent.event_date,
        user: lastEvent.user,
        remarks: "Asset in Inventory",
      });
    }
  });

  return groups;
};

// ---------------------- Modal Component ----------------------
const AssetLifecycleModal = ({ data, onClose }) => {
  const [groupedEvents, setGroupedEvents] = useState([]);
  const [selectedUser, setSelectedUser] = useState("All");

  useEffect(() => {
    if (data?.events) setGroupedEvents(groupByAllocationCycles(data.events));
  }, [data]);

  if (!data) return null;

  const { asset } = data;

  const employeeUsers =
    data?.events
      ?.map((e) => e.user)
      .filter((u) => u?.role?.toLowerCase() === "employee")
      .filter((v, i, a) => a.findIndex((x) => x.fullname === v.fullname) === i)
      .map((u) => u.fullname) || [];

  const filteredCycles =
    selectedUser === "All"
      ? groupedEvents
      : groupedEvents.filter((group) =>
          group.events.some((event) => event.user?.fullname === selectedUser)
        );

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-xl modal-dialog-centered"
        style={{ maxWidth: "1000px" }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {asset?.asset_name || "Asset Lifecycle"}
            </h5>
          </div>

          {/* Filter + Download */}
          <div className="px-4 py-2 border-bottom d-flex justify-content-between align-items-center">
            {employeeUsers.length > 0 && (
              <div className="d-flex align-items-center flex-nowrap">
                {/* <label className="fw-semibold me-2 mb-0 text-nowrap">
                  Filter by Employee:
                </label>
                <select
                  className="form-select form-select-sm"
                  style={{ maxWidth: "200px" }}
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="All">All Employees</option>
                  {employeeUsers.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select> */}
              </div>
            )}

            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                const csv = filteredCycles
                  .map((group) =>
                    group.events.map((e) => [
                      group.cycleNumber,
                      getEventLabel(e.event_type),
                      new Date(e.event_date).toLocaleString(),
                      e.user?.fullname || "N/A",
                      e.user?.role || "N/A",
                      e.remarks || "No remarks",
                    ])
                  )
                  .flat();
                const csvContent =
                  "data:text/csv;charset=utf-8," +
                  ["Cycle,Event,Date,User,Role,Remarks"]
                    .concat(csv.map((r) => r.join(",")))
                    .join("\r\n");
                const link = document.createElement("a");
                link.href = encodeURI(csvContent);
                link.download = `asset_${asset.asset_name.replace(
                  /\s+/g,
                  "_"
                )}_report.csv`;
                link.click();
              }}
            >
              Download Report
            </button>
          </div>

          {/* Body */}
          <div
            className="modal-body custom-scroll"
            style={{ maxHeight: "380px", overflowY: "auto" }}
          >
            {filteredCycles.length ? (
              filteredCycles.map((group) => (
                <div key={group.cycleNumber} className="position-relative mb-4">
                  <div
                    className="text-primary fw-semibold position-absolute"
                    style={{
                      top: -15,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "0.9rem",
                      background: "#fff",
                      padding: "0 8px",
                      zIndex: 2,
                    }}
                  >
                    Allocation Cycle {group.cycleNumber}
                  </div>

                  <div className="position-relative ps-3">
                    <div
                      className="timeline-connector position-absolute animated-line"
                      style={{
                        left: 32,
                        top: 0,
                        width: 4,
                        zIndex: 1,
                        borderRadius: 2,
                      }}
                    />
                    {group.events.map((event) => {
                      const { Icon, color: bg } =
                        eventTypeIconMap[event.event_type] ||
                        eventTypeIconMap.DEFAULT;
                      return (
                        <div
                          key={event.id}
                          className="d-flex mb-3 position-relative"
                        >
                          <span
                            className="timeline-dot d-flex justify-content-center align-items-center shadow"
                            style={{
                              width: 36,
                              height: 36,
                              backgroundColor: bg,
                              borderRadius: "50%",
                              zIndex: 2,
                              marginRight: 16,
                            }}
                          >
                            <Icon size={16} color="white" strokeWidth={2} />
                          </span>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-semibold" style={{ color: bg }}>
                                {getEventLabel(event.event_type)}
                              </span>
                              <span className="small text-muted">
                                {new Date(event.event_date).toLocaleString()}
                              </span>
                            </div>
                            <div className="ms-2">
                              <div>
                                <strong>{getUserLabel(event.event_type)}:</strong>{" "}
                                {event.user?.fullname || "N/A"}{" "}
                                <small className="text-muted">
                                  ({event.user?.role || "N/A"})
                                </small>
                              </div>
                              <div
                                className="text-secondary"
                                style={{ fontSize: "0.95rem" }}
                              >
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
              ))
            ) : (
              <p className="px-3">No events found.</p>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-dark" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default AssetLifecycleModal;
