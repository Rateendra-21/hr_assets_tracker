import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const EditEmployeeModal = ({ show, handleClose, onSave, employeeData }) => {
  const initialFormState = {
    fullName: "",
    mobileNumber: "",
    email: "",
    employeeId: "",
    designation: "",
    department: "",
    workLocation: "",
    reportingManager: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchLocations();
  }, []);

  useEffect(() => {
    if (employeeData) {
      setFormData({
        fullName: employeeData.fullname || "",
        mobileNumber: employeeData.mobile_no || "",
        email: employeeData.email || "",
        employeeId: employeeData.employee_id || "",
        designation: employeeData.designation || "",
        department: employeeData.department_id
          ? String(employeeData.department_id)
          : "",
        workLocation: employeeData.location_id
          ? String(employeeData.location_id)
          : "",
        reportingManager: employeeData.reporting_manager || "",
      });
    }
  }, [employeeData]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/departments/");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/locations/");
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value) return "Full Name is required";
        if (/^\s/.test(value)) return "Cannot start with space";
        if (/[^a-zA-Z\s]/.test(value)) return "Only letters and spaces allowed";
        break;

      case "mobileNumber":
        if (!value) return "Mobile Number is required";
        if (/^\s/.test(value)) return "Cannot start with space";
        if (/[^0-9]/.test(value)) return "Only digits allowed";
        if (value.length !== 10) return "Mobile number must be 10 digits";
        break;

      case "email":
        if (!value) return "Email is required";
        if (/^\s/.test(value)) return "Cannot start with space";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email";
        break;

      case "designation":
        if (!value) return "Designation is required";
        if (/^\s/.test(value)) return "Cannot start with space";
        break;

      case "reportingManager":
        if (!value) return "Reporting Manager is required";
        if (/^\s/.test(value)) return "Cannot start with space";
        if (/[^a-zA-Z\s]/.test(value)) return "Only letters and spaces allowed";
        break;

      case "department":
      case "workLocation":
        if (!value)
          return `${
            name === "department" ? "Department" : "Work Location"
          } is required`;
        break;

      default:
        return "";
    }
    return "";
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      // Skip validation for Employee ID because it is disabled
      if (key === "employeeId") return;
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) newErrors[key] = errorMsg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (/^\s/.test(value)) return; // prevent leading space
    setFormData({ ...formData, [name]: value });
    const errorMsg = validateField(name, value);
    setErrors({ ...errors, [name]: errorMsg });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const token = userData?.access_token;
    if (!token) {
      toast.error("You are not logged in.");
      setLoading(false);
      return;
    }

    // Construct payload with only allowed fields
    const payload = {
      fullname: formData.fullName,
      mobile_no: formData.mobileNumber,
      email: formData.email,
      designation: formData.designation,
      reporting_manager: formData.reportingManager,
      department_id: formData.department ? parseInt(formData.department) : null,
      location_id: formData.workLocation
        ? parseInt(formData.workLocation)
        : null,
    };

    try {
      const url = `http://127.0.0.1:8000/employees/update/${formData.employeeId}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json","Authorization": `Bearer ${token}`, },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update employee");
      }

      toast.success("Employee updated successfully!");
      handleClose();
      if (onSave) onSave();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong!");
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h5 className="modal-title">Edit Employee</h5>
              <small className="text-muted">Update employee details</small>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          <div
            className="modal-body"
            style={{ height: "430px", overflowY: "auto" }}
          >
            <form onSubmit={handleSubmit} className="row g-3">
              {/** Full form fields with validation */}
              {[
                { label: "Full Name", name: "fullName", type: "text" },
                {
                  label: "Mobile Number",
                  name: "mobileNumber",
                  type: "text",
                  maxLength: 10,
                },
                { label: "Email", name: "email", type: "email" },
                {
                  label: "Employee ID",
                  name: "employeeId",
                  type: "text",
                  disabled: true,
                },
                { label: "Designation", name: "designation", type: "text" },
                {
                  label: "Reporting Manager",
                  name: "reportingManager",
                  type: "text",
                },
              ].map((field) => (
                <div className="col-md-6" key={field.name}>
                  <label className="form-label">
                    {field.label} <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    className={`form-control ${
                      errors[field.name] ? "is-invalid" : ""
                    }`}
                    value={formData[field.name]}
                    onChange={handleChange}
                    maxLength={field.maxLength || undefined}
                    disabled={field.disabled || false} // <-- Employee ID is disabled
                  />
                  {errors[field.name] && (
                    <div className="invalid-feedback">{errors[field.name]}</div>
                  )}
                </div>
              ))}

              {/** Department */}
              <div className="col-md-6">
                <label className="form-label">
                  Department <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="department"
                  className={`form-select ${
                    errors.department ? "is-invalid" : ""
                  }`}
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentname}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <div className="invalid-feedback">{errors.department}</div>
                )}
              </div>

              {/** Work Location */}
              <div className="col-md-6">
                <label className="form-label">
                  Work Location <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  name="workLocation"
                  className={`form-select ${
                    errors.workLocation ? "is-invalid" : ""
                  }`}
                  value={formData.workLocation}
                  onChange={handleChange}
                >
                  <option value="">Select location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.locationname}
                    </option>
                  ))}
                </select>
                {errors.workLocation && (
                  <div className="invalid-feedback">{errors.workLocation}</div>
                )}
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-dark">
                  Update Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
