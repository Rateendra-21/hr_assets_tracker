import React, { useState, useEffect } from "react";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "react-hot-toast";

const AddEmployeeModal = ({ show, handleClose, onSave }) => {
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
  const [activeTab, setActiveTab] = useState("manual");
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);

  // Fetch departments & locations
  useEffect(() => {
    fetchDepartments();
    fetchLocations();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/departments/");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/locations/");
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    }
  };

  if (!show) return null;

  // Reset form on modal close
  const handleModalClose = () => {
    setFormData(initialFormState);
    setErrors({});
    handleClose();
  };

  // Field validation
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

      case "employeeId":
      case "designation":
        if (!value)
          return `${
            name === "employeeId" ? "Employee ID" : "Designation"
          } is required`;
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

  // Validate whole form
  const validate = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) newErrors[key] = errorMsg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (/^\s/.test(value)) return; // prevent leading space
    setFormData({ ...formData, [name]: value });
    const errorMsg = validateField(name, value);
    setErrors({ ...errors, [name]: errorMsg });
  };

  // Handle CSV upload
  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Only CSV files are allowed!");
      e.target.value = "";
      return;
    }

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("http://127.0.0.1:8000/employees/upload-csv", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Upload failed");
        return;
      }

      // Calculate how many were successfully added (not duplicates or errors)
      const addedCount =
        data.added?.length ||
        0 ||
        // Fallback: If API only gives message, try to infer from existing structure
        (data.message && !data.duplicates?.length && !data.errors?.length
          ? 1
          : 0);

      // Only show success toast if at least one record was inserted
      if (addedCount > 0) {
        toast.success(
          data.message || `${addedCount} employee(s) added successfully`
        );
      }

      if (data.duplicates?.length > 0) {
        toast.error(
          `Skipped ${data.duplicates.length} duplicates: ${data.duplicates.join(
            ", "
          )}`
        );
      }

      if (data.errors?.length > 0) {
        data.errors.forEach((err) => {
          toast.error(`Error with ${err.email || "unknown"}: ${err.error}`);
        });
      }

      e.target.value = "";
      handleModalClose();
      if (onSave) onSave();
    } catch (err) {
      console.error("CSV upload error:", err);
      toast.error("Something went wrong while uploading the file.");
    }
  };

  // Submit form
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        fullname: formData.fullName,
        mobile_no: formData.mobileNumber,
        email: formData.email,
        employee_id: formData.employeeId,
        designation: formData.designation,
        location_id: formData.workLocation,
        reporting_manager: formData.reportingManager,
        employee_type: "Full-Time",
        username: formData.email,
        department_id: formData.department,
        role: "EMPLOYEE",
      };

      const url = "http://127.0.0.1:8000/employees/createemployee";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to create employee");
      }

      const result = await res.json();
      console.log("Employee created:", result);

      setFormData(initialFormState);
      setErrors({});
      handleModalClose();
      if (onSave) onSave();
      toast.success("Employee created successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong!");
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <div>
              <h5 className="modal-title">Add New Employee</h5>
              <small className="text-muted">
                Create a new employee account with system access
              </small>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={handleModalClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Tabs */}
            <div
              className="d-flex border rounded overflow-hidden mb-3 w-100 p-1"
              style={{ width: "fit-content", backgroundColor: "#F4F4F5" }}
            >
              <div
                onClick={() => setActiveTab("manual")}
                className={`w-50 px-3 py-2 text-center fw-semibold ${
                  activeTab === "manual"
                    ? "bg-white text-dark shadow"
                    : "text-muted"
                }`}
                style={{
                  cursor: "pointer",
                  transition: "0.3s",
                  minWidth: "120px",
                }}
              >
                Manual Entry
              </div>
              <div
                onClick={() => setActiveTab("upload")}
                className={`w-50 px-3 py-2 text-center fw-semibold ${
                  activeTab === "upload"
                    ? "bg-white text-dark shadow"
                    : "text-muted"
                }`}
                style={{
                  cursor: "pointer",
                  transition: "0.3s",
                  minWidth: "120px",
                }}
              >
                CSV Upload
              </div>
            </div>

            {/* Manual Entry */}
            {activeTab === "manual" && (
              <div
                style={{
                  height: "390px",
                  overflowY: "auto",
                  padding: "0 10px",
                }}
              >
                <form onSubmit={onSubmit} className="row g-3">
                  {/* Full Name */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Full Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      className={`form-control ${
                        errors.fullName ? "is-invalid" : ""
                      }`}
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && (
                      <div className="invalid-feedback">{errors.fullName}</div>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Mobile Number <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="mobileNumber"
                      className={`form-control ${
                        errors.mobileNumber ? "is-invalid" : ""
                      }`}
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      maxLength={10}
                    />
                    {errors.mobileNumber && (
                      <div className="invalid-feedback">
                        {errors.mobileNumber}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Email <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Employee ID */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Employee ID <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      className={`form-control ${
                        errors.employeeId ? "is-invalid" : ""
                      }`}
                      value={formData.employeeId}
                      onChange={handleChange}
                    />
                    {errors.employeeId && (
                      <div className="invalid-feedback">
                        {errors.employeeId}
                      </div>
                    )}
                  </div>

                  {/* Designation */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Designation <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="designation"
                      className={`form-control ${
                        errors.designation ? "is-invalid" : ""
                      }`}
                      value={formData.designation}
                      onChange={handleChange}
                    />
                    {errors.designation && (
                      <div className="invalid-feedback">
                        {errors.designation}
                      </div>
                    )}
                  </div>

                  {/* Department */}
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
                      <div className="invalid-feedback">
                        {errors.department}
                      </div>
                    )}
                  </div>

                  {/* Work Location */}
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
                      <div className="invalid-feedback">
                        {errors.workLocation}
                      </div>
                    )}
                  </div>

                  {/* Reporting Manager */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Reporting Manager <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="reportingManager"
                      className={`form-control ${
                        errors.reportingManager ? "is-invalid" : ""
                      }`}
                      value={formData.reportingManager}
                      onChange={handleChange}
                    />
                    {errors.reportingManager && (
                      <div className="invalid-feedback">
                        {errors.reportingManager}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button
                      type="button"
                      className="btn btn-outline-dark"
                      onClick={handleModalClose}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-dark">
                      Create Employee
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* CSV Upload */}
            {activeTab === "upload" && (
              <div style={{ height: "370px", overflowY: "auto" }}>
                <div className="border border-2 border-dashed rounded p-4 text-center mb-3">
                  <FileSpreadsheet className="text-dark" size={40} />
                  <h6 className="mt-2">Upload CSV File</h6>
                  <p className="text-muted">
                    Upload a CSV file with employee data. Make sure to use the
                    provided template.
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    className="d-none"
                    id="excelUpload"
                    onChange={handleCSVUpload}
                  />
                  <label htmlFor="excelUpload" className="btn btn-dark">
                    Choose CSV File
                  </label>
                </div>

                <div className="bg-light p-3 rounded">
                  <h6 className="mb-2">CSV File Requirements:</h6>
                  <ul className="mb-0 small text-muted">
                    <li>Use the provided template format</li>
                    <li>All required fields must be filled</li>
                    <li>Employee IDs must be unique</li>
                    <li>Email addresses must be valid</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
