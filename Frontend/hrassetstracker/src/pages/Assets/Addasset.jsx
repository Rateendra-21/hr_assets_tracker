import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import UploadAssetsCSV from "./UploadAssetsCSV";

const AddAsset = ({ onClose, onAssetSaved }) => {
  const initialFormData = {
    asset_name: "",
    category: "",
    model: "",
    serial_number: "",
    manufacturer: "",
    specification: "",
    ip_address: "",
    connectivity_type: "",
    power_source: "",
    color: "",
    power_output: "",
    connector_type: "",
    cable_type: "",
    workLocation: "",
    status: "available",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("manual");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = value.replace(/^\s+/g, "");
    setFormData({ ...formData, [name]: newValue });

    if (newValue.trim() !== "") {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

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

  const generateQrId = () => {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const categoryCode = formData.category.slice(0, 3).toUpperCase();
    const locationName =
      locations.find((loc) => loc.id === parseInt(formData.workLocation))
        ?.locationname || "LOC";
    return `Argibid-${locationName}-${categoryCode}-${randomSeq}`;
  };

  const validateForm = () => {
    const tempErrors = {};

    if (!formData.asset_name) tempErrors.asset_name = "Asset Name is required";
    if (!formData.category) tempErrors.category = "Category is required";
    if (!formData.workLocation)
      tempErrors.workLocation = "Location is required";
    if (!formData.manufacturer)
      tempErrors.manufacturer = "Manufacturer is required";

    if (formData.category === "Laptop" || formData.category === "Desktop") {
      if (!formData.model) tempErrors.model = "Model is required";
      if (!formData.serial_number)
        tempErrors.serial_number = "Serial Number is required";
      if (!formData.specification)
        tempErrors.specification = "Specification is required";
      if (!formData.ip_address)
        tempErrors.ip_address = "IP Address is required";
    }

    if (formData.category === "Mouse") {
      if (!formData.model) tempErrors.model = "Model is required";
      if (!formData.serial_number)
        tempErrors.serial_number = "Serial Number is required";
      if (!formData.connectivity_type)
        tempErrors.connectivity_type = "Connectivity Type is required";
      if (!formData.power_source)
        tempErrors.power_source = "Power Source is required";
      if (!formData.color) tempErrors.color = "Color is required";
    }

    if (formData.category === "Charger") {
      if (!formData.power_output)
        tempErrors.power_output = "Power Output is required";
      if (!formData.connector_type)
        tempErrors.connector_type = "Connector Type is required";
      if (!formData.cable_type)
        tempErrors.cable_type = "Cable Type is required";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const qr_id = generateQrId();

    const payload = {
      ...formData,
      location_id: parseInt(formData.workLocation),
      status: formData.status || "available",
      qr_id,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/assets/assetregister", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to save asset");
      }

      await res.json();
      toast.success("Asset saved successfully");
      setFormData(initialFormData);
      onAssetSaved?.();
    } catch (err) {
      toast.error(`${err.message}`);
    }
  };

  const renderLabel = (label, isRequired = false) => (
    <label className="form-label">
      {label} {isRequired && <span style={{ color: "red" }}>*</span>}
    </label>
  );

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div
          className="modal-dialog"
          style={{ maxWidth: "800px", maxHeight: "500px" }}
        >
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <div>
                <h5 className="modal-title">Register Asset</h5>
                <small className="text-muted">
                  Fill in the asset details and generate QR ID
                </small>
              </div>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            {/* Tabs */}
            <div
              className="d-flex border rounded overflow-hidden my-3 p-1"
              style={{ backgroundColor: "#F4F4F5", marginLeft: "20px", marginRight: "20px" }}
            >
              <div
                onClick={() => setActiveTab("manual")}
                className={`flex-grow-1 px-3 py-2 text-center fw-semibold ${
                  activeTab === "manual" ? "bg-white text-dark shadow" : "text-muted"
                }`}
                style={{ cursor: "pointer", transition: "0.3s", minWidth: "120px", marginRight: "10px" }}
              >
                Manual Entry
              </div>
              <div
                onClick={() => setActiveTab("upload")}
                className={`flex-grow-1 px-3 py-2 text-center fw-semibold ${
                  activeTab === "upload" ? "bg-white text-dark shadow" : "text-muted"
                }`}
                style={{ cursor: "pointer", transition: "0.3s", minWidth: "120px" }}
              >
                CSV Upload
              </div>
            </div>

            {/* Body */}
            <div className="modal-body custom-scroll" style={{ maxHeight: "450px", overflowY: "auto" }}>
              {activeTab === "manual" && (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">

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
                        name="workLocation"
                        className={`form-select ${errors.workLocation ? "is-invalid" : ""}`}
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
                      {errors.workLocation && <div className="invalid-feedback">{errors.workLocation}</div>}
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

                    {/* Laptop / Desktop */}
                    {(formData.category === "Laptop" || formData.category === "Desktop") && (
                      <>
                        <div className="col-md-6">
                          {renderLabel("Model", true)}
                          <input
                            type="text"
                            name="model"
                            className={`form-control ${errors.model ? "is-invalid" : ""}`}
                            value={formData.model}
                            onChange={handleChange}
                          />
                          {errors.model && <div className="invalid-feedback">{errors.model}</div>}
                        </div>
                        <div className="col-md-6">
                          {renderLabel("Serial Number", true)}
                          <input
                            type="text"
                            name="serial_number"
                            className={`form-control ${errors.serial_number ? "is-invalid" : ""}`}
                            value={formData.serial_number}
                            onChange={handleChange}
                          />
                          {errors.serial_number && <div className="invalid-feedback">{errors.serial_number}</div>}
                        </div>
                        <div className="col-md-6">
                          {renderLabel("IP Address", true)}
                          <input
                            type="text"
                            name="ip_address"
                            className={`form-control ${errors.ip_address ? "is-invalid" : ""}`}
                            value={formData.ip_address}
                            onChange={handleChange}
                          />
                          {errors.ip_address && <div className="invalid-feedback">{errors.ip_address}</div>}
                        </div>
                        <div className="col-12">
                          {renderLabel("Specification", true)}
                          <textarea
                            name="specification"
                            className={`form-control ${errors.specification ? "is-invalid" : ""}`}
                            value={formData.specification}
                            onChange={handleChange}
                          />
                          {errors.specification && <div className="invalid-feedback">{errors.specification}</div>}
                        </div>
                      </>
                    )}

                    {/* Mouse */}
                    {formData.category === "Mouse" && (
                      <>
                        <div className="col-md-6">
                          {renderLabel("Model", true)}
                          <input
                            type="text"
                            name="model"
                            className={`form-control ${errors.model ? "is-invalid" : ""}`}
                            value={formData.model}
                            onChange={handleChange}
                          />
                          {errors.model && <div className="invalid-feedback">{errors.model}</div>}
                        </div>
                        <div className="col-md-6">
                          {renderLabel("Serial Number", true)}
                          <input
                            type="text"
                            name="serial_number"
                            className={`form-control ${errors.serial_number ? "is-invalid" : ""}`}
                            value={formData.serial_number}
                            onChange={handleChange}
                          />
                          {errors.serial_number && <div className="invalid-feedback">{errors.serial_number}</div>}
                        </div>
                        <div className="col-md-4">
                          {renderLabel("Connectivity Type", true)}
                          <input
                            type="text"
                            name="connectivity_type"
                            className={`form-control ${errors.connectivity_type ? "is-invalid" : ""}`}
                            value={formData.connectivity_type}
                            onChange={handleChange}
                          />
                          {errors.connectivity_type && <div className="invalid-feedback">{errors.connectivity_type}</div>}
                        </div>
                        <div className="col-md-4">
                          {renderLabel("Power Source", true)}
                          <input
                            type="text"
                            name="power_source"
                            className={`form-control ${errors.power_source ? "is-invalid" : ""}`}
                            value={formData.power_source}
                            onChange={handleChange}
                          />
                          {errors.power_source && <div className="invalid-feedback">{errors.power_source}</div>}
                        </div>
                        <div className="col-md-4">
                          {renderLabel("Color", true)}
                          <input
                            type="text"
                            name="color"
                            className={`form-control ${errors.color ? "is-invalid" : ""}`}
                            value={formData.color}
                            onChange={handleChange}
                          />
                          {errors.color && <div className="invalid-feedback">{errors.color}</div>}
                        </div>
                      </>
                    )}

                    {/* Charger */}
                    {formData.category === "Charger" && (
                      <>
                        <div className="col-md-6">
                          {renderLabel("Power Output", true)}
                          <input
                            type="text"
                            name="power_output"
                            className={`form-control ${errors.power_output ? "is-invalid" : ""}`}
                            value={formData.power_output}
                            onChange={handleChange}
                          />
                          {errors.power_output && <div className="invalid-feedback">{errors.power_output}</div>}
                        </div>
                        <div className="col-md-6">
                          {renderLabel("Connector Type", true)}
                          <input
                            type="text"
                            name="connector_type"
                            className={`form-control ${errors.connector_type ? "is-invalid" : ""}`}
                            value={formData.connector_type}
                            onChange={handleChange}
                          />
                          {errors.connector_type && <div className="invalid-feedback">{errors.connector_type}</div>}
                        </div>
                        <div className="col-md-6">
                          {renderLabel("Cable Type", true)}
                          <input
                            type="text"
                            name="cable_type"
                            className={`form-control ${errors.cable_type ? "is-invalid" : ""}`}
                            value={formData.cable_type}
                            onChange={handleChange}
                          />
                          {errors.cable_type && <div className="invalid-feedback">{errors.cable_type}</div>}
                        </div>
                      </>
                    )}

                    {/* Buttons */}
                    <div className="col-12 mt-4 mb-1 d-flex justify-content-end gap-2">
                      <button type="button" className="btn btn-outline-dark" onClick={onClose}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-dark">
                        Save Asset
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === "upload" && (
                <div className="text-center text-muted ">
                 <UploadAssetsCSV onClose={onClose} onAssetsUploaded={onAssetSaved}></UploadAssetsCSV>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
};

export default AddAsset;
