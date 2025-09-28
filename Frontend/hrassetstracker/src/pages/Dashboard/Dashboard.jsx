import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = sessionStorage.getItem("userData");
    if (!userData) {
      navigate("/login", { replace: true });
      return;
    }

    const parsedUser = JSON.parse(userData);
    const dashboardData = parsedUser.user;
    // console.log("Parsed user object:", dashboardData);

    setUser(dashboardData);
  }, [navigate]);

  if (!user) return null;

  return (
    <main className="flex-grow-1">
      <div
        className="d-flex justify-content-between align-items-center p-2 p-md-3"
        style={{ borderBottom: "1px solid #E5E7EB" }}
      >
        <h2 style={{ marginBottom: "3px" }}>Dashboard</h2>
      </div>

      {/* Welcome Section with black-to-white gradient */}

      <div className="py-3">
        <div
          className="py-3 px-1 px-md-4 rounded text-light mx-3"
          style={{
            background: "linear-gradient(135deg, #0029ddff, #67b5ffff)",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <div className="py-3 px-3 px-md-4 rounded bg-transparent">
            <h2 className="fw-bold" style={{ fontSize: "1.5rem" }}>
              Welcome back {user.fullname}
            </h2>

            {user.role === "SUPER_ADMIN" && (
              <span>
                Manage your organization's admin users and oversee system
                operations.
              </span>
            )}
            {user.role === "ADMIN" && (
              <span>
                Manage employees, assets, and allocations for your organization.
              </span>
            )}
            {user.employee_type === "EMPLOYEE" && (
              <span>View your assigned assets and track their status.</span>
            )}

            <div className="mt-3">
              <span
                className="badge py-2"
                style={{
                  background:
                    user.role === "SUPER_ADMIN"
                      ? "linear-gradient(45deg, #333, #000)"
                      : user.role === "ADMIN"
                      ? "linear-gradient(45deg, #555, #222)"
                      : "linear-gradient(45deg, #777, #444)",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  letterSpacing: "0.05em",
                  padding: "0.5em 1em",
                }}
              >
                {user.role === "SUPER_ADMIN"
                  ? "SUPER ADMIN"
                  : user.role === "ADMIN"
                  ? "ADMIN"
                  : "EMPLOYEE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-3 px-2 px-md-4">{/* Other content here */}</div>
    </main>
  );
};

export default Dashboard;
