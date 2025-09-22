import { useState, useEffect } from "react";

const AssignAsset = ({ asset, onClose, onSave }) => {
  const [employeeId, setEmployeeId] = useState(""); // store selected employee_id
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Asset ID on init:", asset?.id);
  }, [asset]);

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
        // console.log("Active employees:", activeEmployees); 
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

    const selectedEmployee = employees.find(
      (emp) => emp.employee_id === e.target.value
    );

    console.log("Selected employee on change:", selectedEmployee.employee_id);
  };

  // Handle form submit
 
  const handleSubmit = async () => {
  if (!employeeId || !asset?.id) {
    toast.error("Please select an employee!");
    return;
  }

  const selectedEmployee = employees.find(
    (emp) => emp.employee_id === parseInt(employeeId)
  );

  if (!selectedEmployee) {
    toast.error("Selected employee not found!");
    return;
  }

  const userData = JSON.parse(sessionStorage.getItem("userData")) || {};
  const allocatedBy = userData.fullname || "Unknown";

  const payload = {
    asset_id: asset.id,
    employee_id: selectedEmployee.employee_id,
    allocated_by: allocatedBy,
  };

  console.log(payload)

  // try {
  //   toast.loading("Assigning asset...", { id: "assignToast" });

  //   const response = await fetch("http://127.0.0.1:8000/asset-allocations/", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(payload),
  //   });

  //   if (!response.ok) {
  //     const errorData = await response.json();
  //     console.error("Failed to assign asset:", errorData);
  //     toast.error("Failed to assign asset!", { id: "assignToast" });
  //     return;
  //   }

  //   const allocationData = await response.json();
  //   console.log("Asset allocated successfully:", allocationData);
  //   toast.success("Asset assigned successfully!", { id: "assignToast" });

  //   onSave(allocationData); // pass allocation to parent
  //   onClose();
  // } catch (error) {
  //   console.error("Error assigning asset:", error);
  //   toast.error("Error assigning asset!", { id: "assignToast" });
  // }
};


  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <div>
                <h5 className="modal-title mb-1">Assign Asset to Employee</h5>
                <small className="text-muted">
                  Select an employee to assign {asset?.asset_name}
                </small>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              {/* Asset Details */}
              <div
                className="p-3 mb-2"
                style={{
                  borderRadius: "10px",
                  border: "1px solid lightgrey",
                  backgroundColor: "#F9FAFB",
                }}
              >
                <div className="row small">
                  <div className="col-6 mb-2">
                    <strong>Name:</strong> {asset?.asset_name || "-"}
                  </div>
                  <div className="col-6 mb-2">
                    <strong>Category:</strong>{" "}
                    {asset?.category?.name || asset?.category || "-"}
                  </div>
                  <div className="col-6 mb-2">
                    <strong>Serial:</strong> {asset?.serial_number || "-"}
                  </div>
                  <div className="col-6 mb-2">
                    <strong>Location:</strong>{" "}
                    {asset?.location?.locationname || asset?.location || "-"}
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
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Loading employees..." : "Choose an employee"}
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.employee_id}>
                      {emp.fullname} - {emp.location?.locationname || "-"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-outline-dark" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn btn-dark"
                  onClick={handleSubmit}
                  disabled={!employeeId}
                >
                  Assign Asset
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






