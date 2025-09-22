import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Trash2, User } from "lucide-react";
import { toast } from "react-hot-toast";
import AddAdminModal from "./AddAdminModal";

const AdminList = forwardRef((props, ref) => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/admin/admin/admindata");
      const data = await res.json();
      setAdmins(data);
      setFilteredAdmins(data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Expose fetchAdmins to parent via ref
  useImperativeHandle(ref, () => ({
    fetchAdmins,
  }));

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredAdmins(admins);
    } else {
      const query = search.toLowerCase();
      const filtered = admins.filter(
        (admin) =>
          admin.fullname?.toLowerCase().includes(query) ||
          admin.email?.toLowerCase().includes(query) ||
          admin.employee_id?.toLowerCase().includes(query)
      );
      setFilteredAdmins(filtered);
    }
  }, [search, admins]);

  const handleToggleAdmin = async (employee_id) => {
    if (!window.confirm("Are you sure you want to toggle this admin?")) return;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/admin/admin/deactivateadmin",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_id }),
        }
      );

      if (!response.ok) throw new Error("Failed to toggle admin");

      const data = await response.json();
      toast.success(data.message);
      fetchAdmins();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while toggling the admin.");
    }
  };

  if (loading) return <p>Loading admin data...</p>;

  return (
    <div className="py-2 px-4">
      {/* Search box */}
      <div
        className="py-3 px-3 mb-3"
        style={{ border: "1px solid lightgrey", borderRadius: "8px" }}
      >
        <div className="position-relative w-100">
          <User
            className="position-absolute text-muted"
            style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }}
            size={20}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control ps-5"
            placeholder="Search admins by name, email, or employee ID..."
          />
        </div>
      </div>

      <div
        className="w-100 custom-scroll py-3"
        style={{ maxWidth: "1100px", maxHeight: "330px",paddingRight:"10px" }}
      >
        {filteredAdmins.length === 0 ? (
          <div
            className="text-center py-5 rounded"
            style={{ border: "1px solid lightgrey" }}
          >
            <span className="text-muted">No admin users found</span>
          </div>
        ) : (
          <div className="row g-4">
            {filteredAdmins.map((admin, index) => (
              <div className="col-md-6" key={index}>
                <div className="card h-100 shadow-sm border rounded-3">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title mb-1">{admin.fullname}</h5>
                        <h6 className="card-subtitle text-muted">
                          {admin.designation} • {admin.department?.departmentname}
                        </h6>
                      </div>
                      <span className="badge bg-dark rounded-pill">
                        {admin.is_admin ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="row mb-4">
                      <div className="col-6">
                        <small className="text-muted">Employee ID</small>
                        <p className="mb-1">{admin.employee_id}</p>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Location</small>
                        <p className="mb-1">{admin.location?.locationname}</p>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Email</small>
                        <p className="mb-1">{admin.email}</p>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Mobile</small>
                        <p className="mb-1">{admin.mobile_no}</p>
                      </div>
                    </div>

                    <div className="mt-auto d-flex gap-2 justify-content-end">
                      <button
                        className="btn btn-danger btn-sm d-flex align-items-center"
                        onClick={() => handleToggleAdmin(admin.employee_id)}
                      >
                        <Trash2 size={18} className="mx-2" />{" "}
                        {admin.is_admin ? "Deactivate" : "Activate"}
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
  );
});

export default AdminList;
