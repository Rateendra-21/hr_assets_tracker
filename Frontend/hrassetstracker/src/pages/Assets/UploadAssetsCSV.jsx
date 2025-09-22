import { useState } from "react";
import { toast } from "react-hot-toast";
import { FileSpreadsheet } from "lucide-react"; // make sure this import is added

const UploadAssetsCSV = ({ onClose, onAssetsUploaded }) => {
  const [loading, setLoading] = useState(false);

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/assets/upload-csv`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      toast.success("CSV uploaded successfully!");
      if (onAssetsUploaded) onAssetsUploaded(data);
    } catch (err) {
      toast.error(err.message || "Failed to upload CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "370px", overflowY: "auto" }}>
      <div className="border border-2 border-dashed rounded p-4 text-center mb-3">
        <FileSpreadsheet className="text-dark" size={40} />
        <h6 className="mt-2">Upload CSV File</h6>
        <p className="text-muted">
          Upload a CSV file with employee data. Make sure to use the provided
          template.
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

      <div className="bg-light p-3 rounded text-start">
  <h6 className="mb-2">CSV File Requirements:</h6>
  <ul className="mb-0 small text-muted">
    <li>Use the provided template format</li>
    <li>All required fields must be filled</li>
    <li>Employee IDs must be unique</li>
    <li>Email addresses must be valid</li>
  </ul>
</div>

    </div>
  );
};

export default UploadAssetsCSV;
