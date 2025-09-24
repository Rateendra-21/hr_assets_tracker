import { useEffect } from "react";

const EmployeeView = ({ employee, onClose }) => {
  if (!employee) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        className="bg-white p-4 rounded shadow"
        style={{ maxWidth: "600px", width: "100%" }}
      >
        <h5 className="mb-4">Employee Details</h5>

        <div className="row mb-3">
          <div className="col-6">
            <small className="text-muted">Full Name</small>
            <p className="mb-1">{employee.fullname}</p>
          </div>
          <div className="col-6">
            <small className="text-muted">Employee ID</small>
            <p className="mb-1">{employee.employee_id}</p>
          </div>
          <div className="col-6">
            <small className="text-muted">Email</small>
            <p className="mb-1">{employee.email}</p>
          </div>
          <div className="col-6">
            <small className="text-muted">Mobile</small>
            <p className="mb-1">{employee.mobile_no}</p>
          </div>
          <div className="col-6">
            <small className="text-muted">Designation</small>
            <p className="mb-1">{employee.designation}</p>
          </div>
          <div className="col-6">
            <small className="text-muted">Department</small>
            <p className="mb-1">{employee.department?.departmentname}</p>
          </div>
          <div className="col-6">
            <small className="text-muted">Location</small>
            <p className="mb-1">{employee.location?.locationname}</p>
          </div>
          <div className="col-6">
            <small className="text-muted">Status</small>
            <p className="mb-1">{employee.is_active ? "Active" : "Inactive"}</p>
          </div>
        </div>

        <div className="mt-3 text-end">
          <button className="btn btn-dark" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeView;
