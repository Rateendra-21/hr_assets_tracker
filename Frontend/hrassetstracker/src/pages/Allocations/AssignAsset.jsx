import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const AssignAsset = ({ assets, onClose, onSave }) => {
  const [employeeId, setEmployeeId] = useState(""); // store selected employee_id
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [makeAdmin, setMakeAdmin] = useState(false); // New state for admin checkbox

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:8000/employees/");
        const data = await response.json();

        // Filter active employees
        const activeEmployees = Array.isArray(data)
          ? data.filter((emp) => emp.is_active === true)
          : [];

        setEmployees(activeEmployees);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Handle select change
  const handleEmployeeChange = (e) => {
    setEmployeeId(e.target.value);
    console.log("Selected employee ID:", e.target.value);
  };

  // Handle admin checkbox change
  const handleAdminChange = (e) => {
    setMakeAdmin(e.target.checked);
  };

  


// const handleSubmit = async () => {
//   if (!employeeId) {
//     alert("Please select an employee!");
//     return;
//   }

//   if (assets.length === 0) {
//     alert("No assets selected!");
//     return;
//   }

//   const selectedEmployee = employees.find(emp => emp.employee_id === parseInt(employeeId));
//   console.log("Selected Employee:", selectedEmployee);

//   const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
//   const allocatedBy = userData.fullname || "Admin"; 

//   setSubmitting(true);

//   try {
//     const allocations = assets.map(asset => ({
//       asset_id: asset.id,
//       employee_id: parseInt(employeeId),
//       allocated_by: allocatedBy, // Send as string
//     }));

//     // Fixed API endpoint URL to match backend route
//     const response = await fetch("http://127.0.0.1:8000/asset_allocations/bulk", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(allocations),
//     });
//     const result = await response.json();

//     // Just log the payload
//     console.log("Payload to send:", allocations);

//     // Optional: show alert to verify
//     alert(`Payload ready for submission: ${JSON.stringify(allocations, null, 2)}`);

//     // If you have an onSave function you still want to call
//     onSave(employeeId);

//   } catch (error) {
//     console.error("Error in asset allocation process:", error);
//     alert("An unexpected error occurred during asset allocation");
//   } finally {
//     setSubmitting(false);
//   }
// };




  const handleSubmit = async () => {
  if (!employeeId) {
    alert("Please select an employee!");
    return;
  }

  if (assets.length === 0) {
    alert("No assets selected!");
    return;
  }

  const selectedEmployee = employees.find(emp => emp.employee_id === parseInt(employeeId));
  console.log("Selected Employee:", selectedEmployee);

  const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
  const allocatedBy = userData.fullname || "Admin"; 

  setSubmitting(true);

  try {
    // Prepare allocations payload
    const allocations = assets.map(asset => ({
      asset_id: asset.id,
      employee_id: parseInt(employeeId),
      allocated_by: allocatedBy,
      // status: "assigned" 
    }));

    // Backend endpoint
    const response = await fetch("http://127.0.0.1:8000/asset-allocations/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allocations),
    });

    const result = await response.json();

    console.log("Payload sent:", allocations);
    console.log("API response:", result);

    if (result.errors > 0) {
      alert(`Some allocations failed: ${JSON.stringify(result.error_details, null, 2)}`);
    } else {
      alert("Assets allocated successfully!");
    }

    onSave(employeeId); // optional post-save action

  } catch (error) {
    console.error("Error in asset allocation process:", error);
    alert("An unexpected error occurred during asset allocation");
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
              ></button>
            </div>

            <div className="modal-body">
              {/* Selected Assets Summary */}
              <div className="mb-3">
                <h6>Selected Assets ({assets.length})</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Asset Name</th>
                        <th>Category</th>
                        <th>Serial Number</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((asset) => (
                        <tr key={asset.id}>
                          <td>{asset.asset_name}</td>
                          <td>{asset.category?.name || asset.category || "-"}</td>
                          <td>{asset.serial_number || "-"}</td>
                          <td>{asset.location?.locationname || asset.location || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              
              {/* Admin checkbox */}
              {/* <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="makeAdminCheck"
                  checked={makeAdmin}
                  onChange={handleAdminChange}
                  disabled={loading || submitting}
                />
                <label className="form-check-label" htmlFor="makeAdminCheck">
                  Make this employee an admin
                </label>
              </div> */}

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
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={!employeeId || submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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






