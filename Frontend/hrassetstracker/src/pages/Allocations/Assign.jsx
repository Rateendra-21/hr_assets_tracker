import { useState, useEffect } from "react";
import { Box, LayoutGrid, Table } from "lucide-react";
import Assignedlist from "./Assignedlist";
import { toast } from "react-hot-toast";

const Assign = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [activeView, setActiveView] = useState("assigned");
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Fetch all assets
  const fetchAssets = async () => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const token = userData?.access_token;

    if (!token) {
      toast.error("You are not logged in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/assets/getAllAssets`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch assets");

      setAssets(data.filter((asset) => asset.status === "AVAILABLE"));
    } catch (err) {
      console.error("Error fetching assets:", err);
      toast.error(err.message || "Something went wrong while fetching assets.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const token = userData?.access_token;
      if (!token) return;

      const response = await fetch(`${baseUrl}/employees/getemployee`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to fetch employees");

      const activeEmployees = Array.isArray(data)
        ? data.filter((emp) => emp.is_active === true)
        : [];
      setEmployees(activeEmployees);
    } catch (err) {
      console.error("Error fetching employees:", err);
      toast.error("Error fetching employees");
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchEmployees();
  }, []);

  // Filter assets
  const filteredAssets =
    categoryFilter === "all"
      ? assets
      : assets.filter(
          (a) => (a.category?.name || a.category) === categoryFilter
        );

  // Handle asset selection
  const handleAssetSelect = (asset) => {
    setSelectedAssets((prev) => {
      const isSelected = prev.some((a) => a.id === asset.id);
      return isSelected
        ? prev.filter((a) => a.id !== asset.id)
        : [...prev, asset];
    });
  };

  // Assign assets
  const handleAssignAssets = async () => {
    if (!employeeId) {
      toast.error("Please select an employee!");
      return;
    }
    if (selectedAssets.length === 0) {
      toast.error("Please select at least one asset!");
      return;
    }

    const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
    const userId = userData.user?.id || 1;
    const token = userData?.access_token;

    const payload = {
      employee_id: parseInt(employeeId),
      asset_ids: selectedAssets.map((asset) => asset.id),
      user_id: userId,
    };

    setSubmitting(true);
    try {
      const response = await fetch(`${baseUrl}/assignasset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        toast.error(errData.detail || "Failed to assign assets");
        setSubmitting(false);
        return;
      }

      toast.success("Assets assigned successfully!");
      setSelectedAssets([]);
      setEmployeeId("");
      fetchAssets();
    } catch (error) {
      console.error("Error assigning assets:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-grow-1">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 rounded p-3 bg-mix shadow-sm">
        <div className="d-flex flex-column mb-2 mb-md-0">
          <h5 className="text-dark d-flex align-items-center mb-1">
            <Box className="me-2 text-muted" size={20} />
            Allocations
          </h5>
          <small className="text-muted">
            Select assets using checkboxes and assign them to an employee
          </small>
        </div>

        <div>
          <div className="btn-group w-100 w-md-auto" role="group">
            <button
              type="button"
              className={`btn btn-sm rounded-start ${
                activeView === "assigned"
                  ? "btn-dark text-white"
                  : "btn-outline-light"
              }`}
              onClick={() => setActiveView("assigned")}
            >
              Assigned Asset
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-end ${
                activeView === "assign"
                  ? "btn-dark text-white"
                  : "btn-outline-light"
              }`}
              onClick={() => setActiveView("assign")}
            >
              Assign Asset
            </button>
          </div>
        </div>
      </div>

      {activeView === "assigned" && (
        <div className="p-3 border rounded bg-white mb-2">
          <Assignedlist refreshAssets={fetchAssets} />
        </div>
      )}

      {activeView === "assign" && (
        <>
          <div className="p-3 border rounded bg-white mb-2 mt-4">
            <div className="row align-items-center">
              {/* Category Filter */}
              <div className="col-12 col-md-3 mb-md-0">
                <select
                  id="categoryFilter"
                  className="form-select form-select-sm w-100"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Category</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Mouse">Mouse</option>
                  <option value="Charger">Charger</option>
                </select>
              </div>

              {/* View Mode Buttons */}
              <div className="col-12 col-md-2 mb-2 mb-md-0 d-flex align-items-center">
                <button
                  className={`btn btn-dark btn-sm ${
                    viewMode === "grid" ? "" : "opacity-75"
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  className={`btn btn-dark btn-sm ms-2 ${
                    viewMode === "table" ? "" : "opacity-75"
                  }`}
                  onClick={() => setViewMode("table")}
                >
                  <Table size={14} />
                </button>
              </div>

              {/* Employee Dropdown + Assign Button */}
              <div className="col-12 col-md-7 d-flex justify-content-md-end align-items-center gap-2">
                <select
                  className="form-select form-select-sm w-auto"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                >
                  <option value="">Select Employee To Assign</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullname} - {emp.location?.locationname || "-"}
                    </option>
                  ))}
                </select>

                <button
                  className="btn btn-dark btn-sm"
                  onClick={handleAssignAssets}
                  disabled={
                    selectedAssets.length === 0 ||
                    !employeeId ||
                    submitting
                  }
                >
                  {submitting
                    ? "Assigning..."
                    : `Assign Selected (${selectedAssets.length})`}
                </button>
              </div>
            </div>
          </div>

          {/* Asset list section */}
          <div>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No available assets found</p>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div
                    className="w-100 custom-scroll py-2"
                    style={{
                      maxWidth: "1100px",
                      maxHeight: "330px",
                      paddingRight: "10px",
                    }}
                  >
                    <div className="row g-3">
                      {filteredAssets.map((asset) => (
                        <div
                          className="col-12 col-sm-6 col-lg-4"
                          key={asset.id}
                        >
                          <div
                            className={`card h-100 shadow-sm border rounded-3 ${
                              selectedAssets.some((a) => a.id === asset.id)
                                ? "border-primary"
                                : ""
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleAssetSelect(asset)}
                          >
                            <div className="card-body d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
                                <div>
                                  <h5
                                    className="card-title mb-1"
                                    style={{ fontSize: "1rem" }}
                                  >
                                    {asset.asset_name}
                                  </h5>
                                  <h6
                                    className="card-subtitle text-muted"
                                    style={{ fontSize: "0.85rem" }}
                                  >
                                    {asset.category || "-"}
                                  </h6>
                                </div>
                                <div className="form-check mt-1 mt-md-0">
                                  <input
                                    className="form-check-input"
                                    style={{
                                      border: "1px solid black",
                                      cursor: "pointer",
                                      height: "20px",
                                      width: "20px",
                                    }}
                                    type="checkbox"
                                    checked={selectedAssets.some(
                                      (a) => a.id === asset.id
                                    )}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleAssetSelect(asset);
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="row mb-3">
                                <div className="col-6">
                                  <small className="text-muted">Location</small>
                                  <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                                    {asset.location?.locationname || "-"}
                                  </p>
                                </div>
                                <div className="col-6">
                                  <small className="text-muted">Registered Date</small>
                                  <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                                    {asset.register_date
                                      ? new Date(asset.register_date).toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "-"}
                                  </p>
                                </div>
                                <div className="col-6">
                                  <small className="text-muted">Manufacturer</small>
                                  <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                                    {asset.manufacturer || "-"}
                                  </p>
                                </div>
                                <div className="col-6">
                                  <small className="text-muted">Status</small>
                                  <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                                    {asset.status || "-"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="shadow rounded"
                    style={{ border: "1px solid lightgrey" }}
                  >
                    <div
                      className="table-responsive custom-scroll"
                      style={{
                        maxHeight: "500px",
                        overflow: "auto",
                        padding: "20px",
                      }}
                    >
                      <table className="table table-sm mb-0 align-middle text-center">
                        <thead>
                          <tr>
                            <th><small>Select</small></th>
                            <th><small>Asset Name</small></th>
                            <th><small>Category</small></th>
                            <th><small>Location</small></th>
                            <th><small>Registered Date</small></th>
                            <th><small>Manufacturer</small></th>
                            <th><small>Status</small></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAssets.map((asset) => {
                            const formattedDate = asset.register_date
                              ? new Date(asset.register_date).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-";
                            const isSelected = selectedAssets.some(
                              (a) => a.id === asset.id
                            );

                            return (
                              <tr
                                key={asset.id}
                                className={isSelected ? "table-primary" : ""}
                                style={{ cursor: "pointer" }}
                                onClick={() => handleAssetSelect(asset)}
                              >
                                <td className="text-center">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleAssetSelect(asset)}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ transform: "scale(0.9)" }}
                                  />
                                </td>
                                <td><small>{asset.asset_name}</small></td>
                                <td><small>{asset.category || "-"}</small></td>
                                <td><small>{asset.location?.locationname || "-"}</small></td>
                                <td><small>{formattedDate}</small></td>
                                <td><small>{asset.manufacturer || "-"}</small></td>
                                <td><small>{asset.status || "-"}</small></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
};

export default Assign;



