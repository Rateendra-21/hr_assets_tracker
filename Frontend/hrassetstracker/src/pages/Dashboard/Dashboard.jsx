import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TrackAsset from "../Common/TrackAsset";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = sessionStorage.getItem("userData");
    if (!userData) {
      navigate("/login", { replace: true });
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) return null;

  return (
    <main className="flex-grow-1">
      <div
        className="d-flex justify-content-between align-items-center p-2 p-md-3"
        style={{ borderBottom: "1px solid #E5E7EB" }}
      >
        <h2 className="mb-1">Dashboard</h2>
      </div>

      {/* Welcome Section */}
      <div className="py-3 px-2 px-md-4" style={{ backgroundColor: "#F9FAFB" }}>
        <div className="bg-primary py-3 px-3 px-md-4 rounded text-light">
          <h2 className="fw-bold" style={{ fontSize: "1.5rem" }}>
            Welcome back {user.fullname}
          </h2>

          {user.employee_type === "super_admin" && (
            <span>
              Manage your organization's admin users and oversee system
              operations.
            </span>
          )}
          {user.employee_type === "admin" && (
            <span>
              Manage employees, assets, and allocations for your organization.
            </span>
          )}
          {user.employee_type === "employee" && (
            <span>View your assigned assets and track their status.</span>
          )}

          <div className="mt-2">
            <span className="badge text-bg-dark py-2">
              {user.employee_type === "super_admin"
                ? "SUPER ADMIN"
                : user.employee_type === "admin"
                ? "ADMIN"
                : "EMPLOYEE"}
            </span>
          </div>
        </div>
      </div>

      {/* <TrackAsset></TrackAsset> */}
      <div className="py-3 px-2 px-md-4">
        {/* Dashboard widgets or components */}
      </div>
    </main>
  );
};

export default Dashboard;
