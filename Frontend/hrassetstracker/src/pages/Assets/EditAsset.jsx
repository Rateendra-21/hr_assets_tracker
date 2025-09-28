import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const EditAsset = ({ asset, onClose, onSave }) => {
  if (!asset) return null;

  const [formData, setFormData] = useState({
    asset_name: asset.asset_name || "",
    category: asset.category || "",
    model: asset.model || "",
    serial_number: asset.serial_number || "",
    manufacturer: asset.manufacturer || "",
    specification: asset.specification || "",
    ip_address: asset.ip_address || "",
    connectivity_type: asset.connectivity_type || "",
    power_source: asset.power_source || "",
    color: asset.color || "",
    power_output: asset.power_output || "",
    connector_type: asset.connector_type || "",
    cable_type: asset.cable_type || "",
    location_id: asset.location?.id || "",
    status: asset.status || "available",
    qr_id: asset.qr_id || "",
    remarks: asset.remarks || "",
  });

  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/locations/");
        const data = await res.json();
        setLocations(data);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (value.trim() !== "") setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.asset_name) tempErrors.asset_name = "Asset Name is required";
    if (!formData.category) tempErrors.category = "Category is required";
    if (!formData.location_id) tempErrors.location_id = "Location is required";
    if (!formData.manufacturer) tempErrors.manufacturer = "Manufacturer is required";

    if (["Laptop", "Desktop"].includes(formData.category)) {
      if (!formData.model) tempErrors.model = "Model is required";
      if (!formData.serial_number) tempErrors.serial_number = "Serial Number is required";
      if (!formData.specification) tempErrors.specification = "Specification is required";
      if (!formData.ip_address) tempErrors.ip_address = "IP Address is required";
    }

    if (formData.category === "Mouse") {
      if (!formData.model) tempErrors.model = "Model is required";
      if (!formData.serial_number) tempErrors.serial_number = "Serial Number is required";
      if (!formData.connectivity_type) tempErrors.connectivity_type = "Connectivity Type is required";
      if (!formData.power_source) tempErrors.power_source = "Power Source is required";
      if (!formData.color) tempErrors.color = "Color is required";
    }

    if (formData.category === "Charger") {
      if (!formData.power_output) tempErrors.power_output = "Power Output is required";
      if (!formData.connector_type) tempErrors.connector_type = "Connector Type is required";
      if (!formData.cable_type) tempErrors.cable_type = "Cable Type is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/assets/updateasset/${asset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update asset");
      }

      toast.success("Asset updated successfully!");
      
      const updatedAsset = await response.json();
      onSave(updatedAsset);
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderLabel = (label, required = false) => (
    <label className="form-label">
      {label} {required && <span style={{ color: "red" }}>*</span>}
    </label>
  );

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog" style={{ maxWidth: "800px" }}>
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <div>
                <h5 className="modal-title">Edit Asset</h5>
                <small className="text-muted">Update asset details</small>
              </div>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="modal-body custom-scroll" style={{ maxHeight: "500px", overflowY: "auto" }}>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Category */}
                  <div className="col-md-6">
                    {renderLabel("Category", true)}
                    <select
                      name="category"
                      className={`form-select ${errors.category ? "is-invalid" : ""}`}
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Desktop">Desktop</option>
                      <option value="Mouse">Mouse</option>
                      <option value="Charger">Charger</option>
                    </select>
                    {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                  </div>

                  {/* Asset Name */}
                  <div className="col-md-6">
                    {renderLabel("Asset Name", true)}
                    <input
                      type="text"
                      name="asset_name"
                      className={`form-control ${errors.asset_name ? "is-invalid" : ""}`}
                      value={formData.asset_name}
                      onChange={handleChange}
                    />
                    {errors.asset_name && <div className="invalid-feedback">{errors.asset_name}</div>}
                  </div>

                  {/* Location */}
                  <div className="col-md-6">
                    {renderLabel("Location", true)}
                    <select
                      name="location_id"
                      className={`form-select ${errors.location_id ? "is-invalid" : ""}`}
                      value={formData.location_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.locationname}
                        </option>
                      ))}
                    </select>
                    {errors.location_id && <div className="invalid-feedback">{errors.location_id}</div>}
                  </div>

                  {/* Manufacturer */}
                  <div className="col-md-6">
                    {renderLabel("Manufacturer", true)}
                    <input
                      type="text"
                      name="manufacturer"
                      className={`form-control ${errors.manufacturer ? "is-invalid" : ""}`}
                      value={formData.manufacturer}
                      onChange={handleChange}
                    />
                    {errors.manufacturer && <div className="invalid-feedback">{errors.manufacturer}</div>}
                  </div>

                  {/* Laptop / Desktop Fields */}
                  {(formData.category === "Laptop" || formData.category === "Desktop") && (
                    <>
                      <div className="col-md-6">
                        {renderLabel("Model", true)}
                        <input type="text" name="model" className={`form-control ${errors.model ? "is-invalid" : ""}`} value={formData.model} onChange={handleChange} />
                        {errors.model && <div className="invalid-feedback">{errors.model}</div>}
                      </div>
                      <div className="col-md-6">
                        {renderLabel("Serial Number", true)}
                        <input type="text" name="serial_number" className={`form-control ${errors.serial_number ? "is-invalid" : ""}`} value={formData.serial_number} onChange={handleChange} />
                        {errors.serial_number && <div className="invalid-feedback">{errors.serial_number}</div>}
                      </div>
                      <div className="col-md-6">
                        {renderLabel("IP Address", true)}
                        <input type="text" name="ip_address" className={`form-control ${errors.ip_address ? "is-invalid" : ""}`} value={formData.ip_address} onChange={handleChange} />
                        {errors.ip_address && <div className="invalid-feedback">{errors.ip_address}</div>}
                      </div>
                      <div className="col-12">
                        {renderLabel("Specification", true)}
                        <textarea name="specification" className={`form-control ${errors.specification ? "is-invalid" : ""}`} value={formData.specification} onChange={handleChange} />
                        {errors.specification && <div className="invalid-feedback">{errors.specification}</div>}
                      </div>
                    </>
                  )}

                  {/* Mouse Fields */}
                  {formData.category === "Mouse" && (
                    <>
                      <div className="col-md-6">
                        {renderLabel("Model", true)}
                        <input type="text" name="model" className={`form-control ${errors.model ? "is-invalid" : ""}`} value={formData.model} onChange={handleChange} />
                        {errors.model && <div className="invalid-feedback">{errors.model}</div>}
                      </div>
                      <div className="col-md-6">
                        {renderLabel("Serial Number", true)}
                        <input type="text" name="serial_number" className={`form-control ${errors.serial_number ? "is-invalid" : ""}`} value={formData.serial_number} onChange={handleChange} />
                        {errors.serial_number && <div className="invalid-feedback">{errors.serial_number}</div>}
                      </div>
                      <div className="col-md-4">
                        {renderLabel("Connectivity Type", true)}
                        <input type="text" name="connectivity_type" className={`form-control ${errors.connectivity_type ? "is-invalid" : ""}`} value={formData.connectivity_type} onChange={handleChange} />
                        {errors.connectivity_type && <div className="invalid-feedback">{errors.connectivity_type}</div>}
                      </div>
                      <div className="col-md-4">
                        {renderLabel("Power Source", true)}
                        <input type="text" name="power_source" className={`form-control ${errors.power_source ? "is-invalid" : ""}`} value={formData.power_source} onChange={handleChange} />
                        {errors.power_source && <div className="invalid-feedback">{errors.power_source}</div>}
                      </div>
                      <div className="col-md-4">
                        {renderLabel("Color", true)}
                        <input type="text" name="color" className={`form-control ${errors.color ? "is-invalid" : ""}`} value={formData.color} onChange={handleChange} />
                        {errors.color && <div className="invalid-feedback">{errors.color}</div>}
                      </div>
                    </>
                  )}

                  {/* Charger Fields */}
                  {formData.category === "Charger" && (
                    <>
                      <div className="col-md-6">
                        {renderLabel("Power Output", true)}
                        <input type="text" name="power_output" className={`form-control ${errors.power_output ? "is-invalid" : ""}`} value={formData.power_output} onChange={handleChange} />
                        {errors.power_output && <div className="invalid-feedback">{errors.power_output}</div>}
                      </div>
                      <div className="col-md-6">
                        {renderLabel("Connector Type", true)}
                        <input type="text" name="connector_type" className={`form-control ${errors.connector_type ? "is-invalid" : ""}`} value={formData.connector_type} onChange={handleChange} />
                        {errors.connector_type && <div className="invalid-feedback">{errors.connector_type}</div>}
                      </div>
                      <div className="col-md-6">
                        {renderLabel("Cable Type", true)}
                        <input type="text" name="cable_type" className={`form-control ${errors.cable_type ? "is-invalid" : ""}`} value={formData.cable_type} onChange={handleChange} />
                        {errors.cable_type && <div className="invalid-feedback">{errors.cable_type}</div>}
                      </div>
                    </>
                  )}

                  {/* Buttons */}
                  <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-dark" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-dark" disabled={loading}>
                      {loading ? "Updating..." : "Update Asset"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
};

export default EditAsset;
