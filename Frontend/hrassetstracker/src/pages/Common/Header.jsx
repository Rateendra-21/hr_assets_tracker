import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import ChangePasswordModal from "./ChangePassword";

const Header = () => {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const routeTitles = {
    "/dashboard": "Dashboard",
    "/asset-management": "Assets",
    "/employee-management": "Employees",
    "/asset-allocation": "Allocations",
    "/repair-requests": "Repair Requests",
    "/track-asset": "Track Asset",
    "/admin-management":"Admin Management"
  };

  const title = routeTitles[location.pathname] || "Page";

  return (
    <>
      <div
        className="d-flex justify-content-between align-items-center border-bottom"
        style={{ padding: "17.3px 30px" }}
      >
        <h4 className="fw-bold mb-0">{title}</h4>
        <button
          onClick={() => setShowModal(true)}
          className="btn d-flex align-items-center"
          title="Change Password"
        >
          <Lock size={19} className="me-2" /> Change Password
        </button>
      </div>

      {/* Password Modal */}
      <ChangePasswordModal show={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default Header;





