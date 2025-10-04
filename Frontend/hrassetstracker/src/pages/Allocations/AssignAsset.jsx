import { Cross, RemoveFormatting, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const AssignAsset = ({ assets, onClose, onSave, onRemove }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const userData = JSON.parse(sessionStorage.getItem("userData"));
        const token = userData?.access_token;

        if (!token) {
          toast.error("You are not logged in.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://127.0.0.1:8000/employees/getemployee",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Handle expired/unauthorized token
        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
          sessionStorage.removeItem("userData");
          localStorage.clear();
          window.location.href = "/login";
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch employees");
        }

        const activeEmployees = Array.isArray(data)
          ? data.filter((emp) => emp.is_active === true)
          : [];

        setEmployees(activeEmployees);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        toast.error(error.message || "Something went wrong.");
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleEmployeeChange = (e) => {
    setEmployeeId(e.target.value);
  };

  const handleSubmit = async () => {
    if (!employeeId) {
      toast.error("Please select an employee!");
      return;
    }
    if (assets.length === 0) {
      toast.error("No assets selected!");
      return;
    }

    const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
    const userId = userData.user?.id || 1; 
    
    const payload = {
      employee_id: parseInt(employeeId),
      asset_ids: assets.map((asset) => asset.id),
      user_id: userId,
    };
    setSubmitting(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/assignasset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.detail || "Failed to assign assets");
        setSubmitting(false);
        return;
      }

      const result = await response.json();

      console.log("API response:", result);

      toast.success("Assets allocated successfully!");
      onSave(employeeId);
    } catch (error) {
      console.error("Error in asset allocation process:", error);
      toast.error("An unexpected error occurred during asset allocation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <div>
                <h5 className="modal-title mb-1">Assign Assets to Employee</h5>
                <small className="text-muted">
                  Select an employee to assign {assets.length} selected assets
                </small>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={submitting}
              />
            </div>

            <div className="modal-body">
              {/* Selected Assets Summary */}
              <div className="mb-3">
                <div
                  className="rounded"
                  style={{ border: "1px solid lightgrey" }}
                >
                  <div className="container-fluid p-0">
                    {loading ? (
                      <div className="text-center py-5">
                        <small className="text-muted">Loading assets...</small>
                      </div>
                    ) : assets.length === 0 ? (
                      <div
                        className="text-center py-5 rounded"
                        style={{ border: "1px solid lightgrey" }}
                      >
                        <small className="text-muted">No assets found</small>
                      </div>
                    ) : (
                      <div
                        className="table-responsive custom-scrollbar"
                        style={{
                          maxHeight: "450px",
                          overflowY: "auto",
                          padding: "10px",
                        }}
                      >
                        <table className="table mb-0 align-middle text-center table-sm">
                          <thead className="">
                            <tr>
                              <th>
                                <small>Asset Name</small>
                              </th>
                              <th>
                                <small>Category</small>
                              </th>
                              <th>
                                <small>Serial Number</small>
                              </th>
                              <th>
                                <small>Location</small>
                              </th>
                              <th>
                                <small>Remove</small>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {assets.map((asset) => (
                              <tr key={asset.id}>
                                <td
                                  className="text-truncate"
                                  style={{ maxWidth: "150px" }}
                                >
                                  <small>{asset.asset_name}</small>
                                </td>
                                <td
                                  className="text-truncate"
                                  style={{ maxWidth: "120px" }}
                                >
                                  <small>
                                    {asset.category?.name ||
                                      asset.category ||
                                      "-"}
                                  </small>
                                </td>
                                <td
                                  className="text-truncate"
                                  style={{ maxWidth: "150px" }}
                                >
                                  <small>{asset.serial_number || "-"}</small>
                                </td>
                                <td
                                  className="text-truncate"
                                  style={{ maxWidth: "150px" }}
                                >
                                  <small>
                                    {asset.location?.locationname ||
                                      asset.location ||
                                      "-"}
                                  </small>
                                </td>
                                <td
                                  className="text-center align-middle"
                                  style={{ verticalAlign: "middle" }}
                                >
                                  <button
                                    type="button"
                                    style={{
                                      borderRadius: "50%",
                                      height: "25px",
                                      width: "25px",
                                      padding: "0",
                                    }}
                                    className="btn btn-sm btn-danger "
                                    onClick={() => onRemove(asset.id)}
                                    disabled={submitting}
                                    aria-label={`Remove ${asset.asset_name}`}
                                  >
                                    <X
                                      size={12}
                                      className="mt-0"
                                      style={{ marginBottom: "3px" }}
                                    />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Employee selection */}
              <div className="mb-3">
                <label className="form-label small text-muted">
                  Select Employee
                </label>
                <select
                  className="form-select"
                  value={employeeId}
                  onChange={handleEmployeeChange}
                  disabled={loading || submitting}
                >
                  <option value="">
                    {loading ? "Loading employees..." : "Choose an employee"}
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullname} - {emp.location?.locationname || "-"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  className="btn btn-outline-dark"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-dark"
                  onClick={handleSubmit}
                  disabled={!employeeId || submitting || assets.length === 0}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                      Assigning Assets...
                    </>
                  ) : (
                    `Assign ${assets.length} Assets`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default AssignAsset;
