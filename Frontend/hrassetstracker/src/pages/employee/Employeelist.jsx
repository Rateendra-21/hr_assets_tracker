import { useEffect, useState, forwardRef } from "react";
import { toast } from "react-hot-toast";
import { User, LayoutGrid, Table, View, Eye, Edit } from "lucide-react";
import EmployeeDeactivate from "../employee/EmployeeDeactivate";
import EmployeeView from "../employee/Employedetailsview";
import EditEmployeeModal from "../employee/EditEmployeeModal";

const EmployeeList = forwardRef(({ employees, refreshList, loading }, ref) => {
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"
  const [viewMode, setViewMode] = useState("grid");
  // Modal states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Filter logic: search + status
  useEffect(() => {
    let filtered = employees;

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.fullname?.toLowerCase().includes(query) ||
          emp.email?.toLowerCase().includes(query) ||
          emp.employee_id?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter(
        (emp) => emp.is_active === 1 || emp.is_active === true
      );
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(
        (emp) => emp.is_active === 0 || emp.is_active === false
      );
    }

    setFilteredEmployees(filtered);
  }, [search, employees, statusFilter]);

  const handleDeactivateClick = (employee) => {
    setSelectedEmployee(employee);
    setShowDeactivateModal(true);
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const closeDeactivateModal = () => {
    setShowDeactivateModal(false);
    setSelectedEmployee(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedEmployee(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  const handleDeactivateSubmit = async (employeeId, reason) => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const token = userData?.access_token;
    if (!token) {
      toast.error("You are not logged in.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/employees/deactivate",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${token}`, },
          body: JSON.stringify({
            employee_id: employeeId.toString(),
            remarks: reason,
          }),
        }
      );

       if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to deactivate employee");
      }

      const data = await response.json();
      toast.success(data.message || "Employee deactivated successfully");

      closeDeactivateModal();
      refreshList();
    } catch (error) {
      console.error(error);
      toast.error(
        error.message || "Something went wrong while deactivating employee."
      );
    }
  };

  const handleActivateClick = async (emp) => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const token = userData?.access_token;
    if (!token) {
      toast.error("You are not logged in.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:8000/employees/activate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: emp.employee_id,
        }),
      });

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to activate employee");
      }

      const data = await response.json();
      console.log("Activation success:", data);
      toast.success(data.message || "Employee activated successfully");

 
      refreshList();
    } catch (error) {
      console.error("Error activating employee:", error);
      toast.error(
        error.message || "Something went wrong while activating employee."
      );
    }
  };

  if (loading) return <p>Loading employee data...</p>;

  return (
    <div className="py-2 px-2 px-md-4">
      {/* Search Box */}

      <div
        className="py-2 px-2 mb-3 mt-2"
        style={{ border: "1px solid lightgrey", borderRadius: "8px" }}
      >
        <div className="row g-2 align-items-center">
         
          <div className="col-12 col-md-7 position-relative">
            <User
              className="position-absolute text-muted"
              size={20}
              style={{
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control ps-5 form-control-sm w-100"
              placeholder="Search employees by name, email, or employee ID..."
            />
          </div>

  
          <div className="col-9 col-md-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select form-select-sm w-100"
            >
              <option value="all">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="col-md-1 col-3">
            <button
              className="btn btn-dark btn-sm  mx-1"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid size={14} className="" />
            </button>

            <button
              className="btn btn-dark btn-sm "
              onClick={() => setViewMode("table")}
            >
              <Table size={14} className="" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Cards */}

      <div style={{ display: viewMode === "grid" ? "block" : "none" }}>
        <div
          className="w-100 custom-scroll py-3"
          style={{
            maxWidth: "1100px",
            maxHeight: "330px",
            paddingRight: "10px",
          }}
        >
          {filteredEmployees.length === 0 ? (
            <div
              className="text-center py-5 rounded"
              style={{ border: "1px solid lightgrey" }}
            >
              <span className="text-muted">No employees found</span>
            </div>
          ) : (
            <div className="row g-3">
              {filteredEmployees.map((emp, index) => (
                <div className="col-12 col-sm-6 col-lg-6" key={emp.id || index}>
                  {/* Card */}
                  <div className="card h-100 shadow-sm border rounded-3">
                    <div className="card-body d-flex flex-column">
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap">
                        <div>
                          <h5
                            className="card-title mb-1"
                            style={{ fontSize: "1rem" }}
                          >
                            {emp.fullname}
                          </h5>
                          <h6
                            className="card-subtitle text-muted"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {emp.designation} •{" "}
                            {emp.department?.departmentname || "-"}
                          </h6>
                        </div>
                        <span
                          className={`badge ${
                            emp.is_active ? "bg-success" : "bg-danger"
                          } rounded-pill mt-1 mt-md-0`}
                        >
                          {emp.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="row mb-3">
                        <div className="col-6 mb-2 mb-md-0">
                          <small className="text-muted">Employee ID</small>
                          <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                            {emp.employee_id}
                          </p>
                        </div>
                        <div className="col-6 mb-2 mb-md-0">
                          <small className="text-muted">Location</small>
                          <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                            {emp.location?.locationname || "-"}
                          </p>
                        </div>
                        <div className="col-6 mb-2 mb-md-0">
                          <small className="text-muted">Email</small>
                          <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                            {emp.email}
                          </p>
                        </div>
                        <div className="col-6 mb-2 mb-md-0">
                          <small className="text-muted">Mobile</small>
                          <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                            {emp.mobile_no}
                          </p>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="mt-auto d-flex gap-2 flex-wrap justify-content-end">
                        {emp.is_active === 1 || emp.is_active === true ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeactivateClick(emp)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleActivateClick(emp)}
                          >
                            Activate
                          </button>
                        )}

                        <button
                          className="btn btn-dark btn-sm"
                          onClick={() => handleView(emp)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-dark text-light btn-sm"
                          onClick={() => handleEditClick(emp)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewMode === "table" && (
        <div
          className="shadow rounded"
          style={{ border: "1px solid lightgrey" }}
        >
          <div className="container-fluid p-0">
            {filteredEmployees.length === 0 ? (
              <div
                className="text-center py-5 rounded"
                style={{ border: "1px solid lightgrey" }}
              >
                <span className="text-muted">No employees found</span>
              </div>
            ) : (
              <div
                className="table-responsive custom-scroll"
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  overflowX: "auto",
                  padding: "20px",
                }}
              >
                <table
                  className="table mb-0 align-middle text-center"
                  style={{ width: "100%", minWidth: "1200px" }}
                >
                  <thead className="table">
                    <tr>
                      <th>
                        <small>Emp ID</small>
                      </th>
                      <th>
                        <small>Name</small>
                      </th>
                      <th>
                        <small>Location</small>
                      </th>
                      <th>
                        <small>Mobile</small>
                      </th>
                      <th>
                        <small>Email</small>
                      </th>
                      <th>
                        <small>Designation</small>
                      </th>
                      <th>
                        <small>Department</small>
                      </th>
                      <th>
                        <small>Status</small>
                      </th>
                      <th>
                        <small>Actions</small>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp, index) => (
                      <tr key={emp.id || index}>
                        <td>
                          <small>{emp.employee_id}</small>
                        </td>
                        <td>
                          <small>{emp.fullname}</small>
                        </td>
                        <td>
                          <small>{emp.location?.locationname || "-"}</small>
                        </td>
                        <td>
                          <small>{emp.mobile_no}</small>
                        </td>
                        <td>
                          <small>{emp.email}</small>
                        </td>
                        <td>
                          <small>{emp.designation || "-"}</small>
                        </td>
                        <td>
                          <small>{emp.department?.departmentname || "-"}</small>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              emp.is_active ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {emp.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="d-flex justify-content-center">
                          {emp.is_active ? (
                            <button
                              className="btn btn-danger btn-sm me-1"
                              onClick={() => handleDeactivateClick(emp)}
                            >
                              <small>Deactivate</small>
                            </button>
                          ) : (
                            <button
                              className="btn btn-success btn-sm me-1"
                              onClick={() => handleActivateClick(emp)}
                            >
                              <small>Activate</small>
                            </button>
                          )}

                          <button
                            className="btn btn-dark btn-sm me-1"
                            onClick={() => handleView(emp)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-dark text-light btn-sm"
                            onClick={() => handleEditClick(emp)}
                          >
                            <Edit size={16} />
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
      )}

      {/* Modals */}
      {showDeactivateModal && selectedEmployee && (
        <EmployeeDeactivate
          employee={selectedEmployee}
          onClose={closeDeactivateModal}
          onSubmit={handleDeactivateSubmit}
        />
      )}

      {showViewModal && selectedEmployee && (
        <EmployeeView employee={selectedEmployee} onClose={closeViewModal} />
      )}

      {showEditModal && selectedEmployee && (
        <EditEmployeeModal
          show={showEditModal}
          handleClose={closeEditModal}
          onSave={refreshList}
          employeeData={selectedEmployee}
        />
      )}
    </div>
  );
});

export default EmployeeList;
