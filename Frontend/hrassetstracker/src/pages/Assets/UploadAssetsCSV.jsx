import { useState } from "react";
import { toast } from "react-hot-toast";
import { FileSpreadsheet } from "lucide-react";

const UploadAssetsCSV = ({ onClose, onAssetsUploaded }) => {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");

  // Handle CSV Upload


//   const handleCSVUpload = async (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   const formData = new FormData();
//   formData.append("file", file);

//   try {
//     setLoading(true);
//     const res = await fetch(
//       `http://127.0.0.1:8000/assets/assetregister/csv`,
//       {
//         method: "POST",
//         body: formData,
//       }
//     );

//     if (!res.ok) {
//       const errData = await res.json();
//       throw new Error(errData.detail || "Upload failed");
//     }

//     const data = await res.json();
//     toast.success("CSV uploaded successfully!");

//     // Call parent function to update the asset list
//     if (onAssetsUploaded) onAssetsUploaded(data);

//     // Close the modal
//     if (onClose) onClose();

//   } catch (err) {
//     toast.error(err.message || "Failed to upload CSV");
//   } finally {
//     setLoading(false);
//   }
// };



const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch(
        `http://127.0.0.1:8000/assets/assetregister/csv`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Upload failed");
      }

      const data = await res.json();
      toast.success("CSV uploaded successfully!");

      // Call parent callback to reload list
      if (onAssetsUploaded) onAssetsUploaded(data);

      // Close modal automatically
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.message || "Failed to upload CSV");
    } finally {
      setLoading(false);
    }
  };


  const downloadAssetCSVTemplate = (selectedCategory) => {
    let headers = ["asset_name", "category", "manufacturer", "workLocation"];

    if (selectedCategory === "Laptop" || selectedCategory === "Desktop") {
      headers.push("model", "serial_number", "specification", "ip_address");
    } else if (selectedCategory === "Mouse") {
      headers.push(
        "model",
        "serial_number",
        "connectivity_type",
        "power_source",
        "color"
      );
    } else if (selectedCategory === "Charger") {
      headers.push("power_output", "connector_type", "cable_type");
    }

    const csvContent = [headers.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedCategory || "all"}_asset_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ height: "350px", overflowY: "auto" }}>
      {/* Category & Download Template Row */}
      <div
        className="row p-3 mx-1 rounded mb-3 align-items-center"
        style={{ border: "1px solid #ccc", backgroundColor: "#f8f9fa" }}
      >
        <div className="col-md-6">
          <select
            className="form-select form-select-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Laptop">Laptop</option>
            <option value="Desktop">Desktop</option>
            <option value="Mouse">Mouse</option>
            <option value="Charger">Charger</option>
          </select>
        </div>
        <div className="col-md-6 d-flex justify-content-end">
          <button
            className="btn btn-dark btn-sm"
            onClick={() => downloadAssetCSVTemplate(category)}
            disabled={!category}
            title={!category ? "Select a category to enable download" : ""}
          >
            Download Template
          </button>
        </div>
      </div>

      {/* CSV Upload Section */}
      <div className="border border-2 border-dashed rounded p-4 text-center mb-3 bg-light">
        <FileSpreadsheet className="text-dark mb-2" size={40} />
        <h6 className="mt-2 mb-1">Upload CSV File</h6>
        <p className="text-muted mb-3">
          Upload a CSV file with asset data. Make sure to use the provided template.
        </p>
        <input
          type="file"
          accept=".csv"
          className="d-none"
          id="excelUpload"
          onChange={handleCSVUpload}
          disabled={loading}
        />
        <label htmlFor="excelUpload" className="btn btn-dark">
          {loading ? "Uploading..." : "Choose CSV File"}
        </label>
      </div>
    </div>
  );
};

export default UploadAssetsCSV;
