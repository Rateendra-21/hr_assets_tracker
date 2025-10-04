import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Trash2, User, LayoutGrid, Table, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import AddAdminModal from "./AddAdminModal";

const AdminList = forwardRef((props, ref) => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(sessionStorage.getItem("userData"));
      const token = userData?.access_token;
      
      const res = await fetch("http://127.0.0.1:8000/admin/admindata", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
      });

      if (res.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch admin data");
      const data = await res.json();
      const admins = data.filter((user) => user.role === "ADMIN");

      setAdmins(admins);
      setFilteredAdmins(admins);
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

  const handleToggleAdmin = async (employee_id, isActive) => {
    const action = isActive ? "deactivate" : "activate";

    if (!window.confirm(`Are you sure you want to ${action} this admin?`))
      return;
     const userData = JSON.parse(sessionStorage.getItem("userData"));
      const token = userData?.access_token;
    const url = `http://127.0.0.1:8000/admin/${action}/${employee_id}`;

    try {

      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" , Authorization: `Bearer ${token}`, },
      });
      if (!response.ok) throw new Error(`Failed to ${action} admin`);

      const data = await response.json();
      toast.success(data.message);
      fetchAdmins();
    } catch (error) {
      console.error(error);
      alert(`Something went wrong while trying to ${action} the admin.`);
    }
  };

  if (loading) return <p>Loading admin data...</p>;

  return (
    <div className="py-2 px-4 ">
      {/* Search box */}

      <div
        className="row align-items-center g-2 mt-2 mb-3"
        style={{
          border: "1px solid lightgrey",
          borderRadius: "8px",
          padding: "8px 12px",
        }}
      >
        <div className="col-12 col-md-11 py-2">
          <div className="position-relative">
            <User
              className="position-absolute text-muted"
              style={{
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
              size={18}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control ps-5 form-control-sm mb-2"
              placeholder="Search admins..."
            />
          </div>
        </div>

        <div className="col-12 col-md-1 py-2  d-flex justify-content-md-end gap-2">
          <button
            className="btn btn-dark btn-sm mb-2"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={14} className="" />
          </button>

          <button
            className="btn btn-dark btn-sm mb-2"
            onClick={() => setViewMode("table")}
          >
            <Table size={14} className="" />
          </button>
        </div>
      </div>

      {/* grid view  */}

      <div style={{ display: viewMode === "grid" ? "block" : "none" }}>
        <div
          className="w-100 custom-scroll py-3"
          style={{
            maxWidth: "1100px",
            maxHeight: "330px",
            paddingRight: "10px",
          }}
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
                            {admin.designation} •{" "}
                            {admin.department?.departmentname}
                          </h6>
                        </div>
                        <span
                          className={`badge rounded-pill ${
                            admin.is_active ? "bg-dark" : "bg-danger"
                          }`}
                        >
                          {admin.is_active ? "Active" : "Inactive"}
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
                          className={`btn btn-sm d-flex align-items-center ${
                            admin.is_active ? "btn-danger" : "btn-success"
                          }`}
                          onClick={() =>
                            handleToggleAdmin(
                              admin.employee_id,
                              admin.is_active
                            )
                          }
                        >
                          {admin.is_active ? "Deactivate" : "Activate"}
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

      {/* Table view  */}
      <div className="shadow rounded">
        {viewMode === "table" && (
          <div className="container-fluid p-0">
            {filteredAdmins.length === 0 ? (
              <div
                className="text-center py-5 rounded"
                style={{ border: "1px solid lightgrey" }}
              >
                <span className="text-muted">No admin users found</span>
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
                  className="table  mb-0 align-middle text-center"
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
                    {filteredAdmins.map((admin, index) => (
                      <tr key={index}>
                        <td>
                          <small>{admin.employee_id}</small>
                        </td>
                        <td>
                          <small>{admin.fullname}</small>
                        </td>
                        <td>
                          <small>{admin.location?.locationname || "-"}</small>
                        </td>
                        <td>
                          <small>{admin.mobile_no}</small>
                        </td>
                        <td>
                          <small>{admin.email}</small>
                        </td>
                        <td>
                          <small>{admin.designation || "-"}</small>
                        </td>
                        <td>
                          <small>
                            {admin.department?.departmentname || "-"}
                          </small>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              admin.is_active ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {admin.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="d-flex justify-content-center">
                          <button
                            className={`btn btn-sm d-flex align-items-center ${
                              admin.is_active ? "btn-danger" : "btn-success"
                            }`}
                            onClick={() =>
                              handleToggleAdmin(
                                admin.employee_id,
                                admin.is_active
                              )
                            }
                          >
                            <small className="me-1">
                              {admin.is_active ? "Deactivate" : "Activate"}
                            </small>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default AdminList;
