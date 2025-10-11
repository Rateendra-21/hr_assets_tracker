import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const AddAdminModal = ({ show, onClose, onSave, editingAdmin }) => {
  const initialFormData = {
    fullName: "",
    mobileNumber: "",
    email: "",
    employeeId: "",
    designation: "",
    department: "",
    workLocation: "",
    reportingManager: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!show) return;
    fetchDepartments();
    fetchLocations();
  }, [show, editingAdmin]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${baseUrl}/departments/`);
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${baseUrl}/locations/`);
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (typeof newValue === "string") newValue = newValue.trimStart();

    if (name === "fullName" || name === "reportingManager") {
      newValue = newValue.replace(/[^a-zA-Z\s]/g, "");
    }

    if (name === "mobileNumber") {
      newValue = newValue.replace(/\D/g, "").slice(0, 10);
    }

    setFormData({ ...formData, [name]: newValue });

    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    for (const field in formData) {
      const value = formData[field];
      if (!value || (typeof value === "string" && !value.trim())) {
        newErrors[field] = "This field is required";
      }
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be exactly 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const token = userData?.access_token;
      if (!token) {
        toast.error("You are not logged in.");
        setLoading(false);
        return;
      }

      const payload = {
        fullname: formData.fullName,
        mobile_no: formData.mobileNumber,
        email: formData.email,
        employee_id: formData.employeeId,
        designation: formData.designation,
        location_id: formData.workLocation,
        reporting_manager: formData.reportingManager,
        employee_type: "Full-Time",
        // username: formData.email,
        department_id: formData.department,
        role: "ADMIN",
      };
      const url = `${baseUrl}/createadmin`;
      const res = await fetch(url, {
        method: "POST",
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
        throw new Error(errorData.detail || "Failed to create admin");
      }
      const result = await res.json();
      console.log("Admin created:", result);
      setFormData(initialFormData);
      setErrors({});
      onSave();
      onClose();
      toast.success("Admin created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const renderLabel = (label) => (
    <label className="form-label">
      {label} <span style={{ color: "red" }}>*</span>
    </label>
  );

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog" style={{ maxWidth: "700px" }}>
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h5 className="modal-title">
                  {editingAdmin ? "Edit Admin" : "Add New Admin"}
                </h5>
                <small className="text-muted">
                  {editingAdmin
                    ? "Update the admin user details"
                    : "Create a new admin user with access to manage employees and assets"}
                </small>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setFormData(initialFormData);
                  setErrors({});
                  onClose();
                }}
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="row g-3">
                {/* Full Name */}
                <div className="col-md-6">
                  {renderLabel("Full Name")}
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
                  {renderLabel("Mobile Number")}
                  <input
                    type="text"
                    name="mobileNumber"
                    className={`form-control ${
                      errors.mobileNumber ? "is-invalid" : ""
                    }`}
                    value={formData.mobileNumber}
                    onChange={handleChange}
                  />
                  {errors.mobileNumber && (
                    <div className="invalid-feedback">
                      {errors.mobileNumber}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="col-md-6">
                  {renderLabel("Email")}
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
                  {renderLabel("Employee ID")}
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
                    <div className="invalid-feedback">{errors.employeeId}</div>
                  )}
                </div>

                {/* Designation */}
                <div className="col-md-6">
                  {renderLabel("Designation")}
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
                    <div className="invalid-feedback">{errors.designation}</div>
                  )}
                </div>

                {/* Department */}
                <div className="col-md-6">
                  {renderLabel("Department")}
                  <select
                    name="department"
                    className={`form-select ${
                      errors.department ? "is-invalid" : ""
                    }`}
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department: parseInt(e.target.value),
                      })
                    }
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

                {/* Work Location */}
                <div className="col-md-6">
                  {renderLabel("Work Location")}
                  <select
                    name="workLocation"
                    className={`form-select ${
                      errors.workLocation ? "is-invalid" : ""
                    }`}
                    value={formData.workLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workLocation: parseInt(e.target.value),
                      })
                    }
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
                  {renderLabel("Reporting Manager")}
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
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                className="btn btn-outline-dark"
                onClick={() => {
                  setFormData(initialFormData);
                  setErrors({});
                  onClose();
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-dark"
                onClick={handleSubmit}
                disabled={loading} // optional, prevent multiple clicks
              >
                {loading
                  ? editingAdmin
                    ? "Updating..."
                    : "Creating..."
                  : editingAdmin
                  ? "Update Admin"
                  : "Create Admin"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
};

export default AddAdminModal;
