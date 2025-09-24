import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import AddAdminModal from "./AddAdminModal";
import AdminList from "./adminlist";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const adminListRef = useRef();

  useEffect(() => {
    const userData = sessionStorage.getItem("userData");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) return null;

  // Callback when admin is saved
  const handleSaveAdmin = () => {
    console.log("Admin created successfully!");
    setShowModal(false);
    // Trigger AdminList to refetch data
    if (adminListRef.current) {
      adminListRef.current.fetchAdmins();
    }
  };

  return (
    <main className="flex-grow-1">
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        <h4 className="fw-bold" style={{ marginBottom: "12px" }}>
          Admin Management
        </h4>
      </div>

      <div className="py-4 px-3 px-md-4" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="row align-items-center">
          {/* Title and subtitle */}
          <div className="col-12 col-md-10 mb-3 mb-md-0">
            <h5 className="fw-bold mb-1">Manage Admins</h5>
            <span className="text-muted">
              Add and manage admin users for your organization
            </span>
          </div>

          {/* Add Admin Button */}
          <div className="col-12 col-md-2 d-flex justify-content-md-end">
            <button
              className="btn btn-dark d-flex align-items-center"
              style={{ width: "auto" }}
              onClick={() => setShowModal(true)}
            >
              <Plus size={18} className="me-2" />
              Add Admin
            </button>
          </div>
        </div>
      </div>

      {/* Admin list */}
      <div>
        <AdminList ref={adminListRef} />
      </div>

      {/* Add Admin Modal */}
      <AddAdminModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveAdmin}
      />
    </main>
  );
};

export default Admin;
