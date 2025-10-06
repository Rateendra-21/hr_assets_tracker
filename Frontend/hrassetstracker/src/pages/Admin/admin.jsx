import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, User } from "lucide-react";
import AddAdminModal from "./AddAdminModal";
import AdminList from "./adminlist";
import Header from "../Common/Header"
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
  
      <Header></Header>

      <div className="d-flex mx-4 mt-4 flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-2 rounded p-3 bg-mix shadow-sm">
        <div className="d-flex flex-column mb-2 mb-md-0">
          <h5 className="text-dark fw-bold mb-1"> <User size={17}/> Manage Admins</h5>
          <small className="text-muted">
            Add and manage admin users for your organization
          </small>
        </div>

        <div>
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} className="me-2" />
            Add Admin
          </button>
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
