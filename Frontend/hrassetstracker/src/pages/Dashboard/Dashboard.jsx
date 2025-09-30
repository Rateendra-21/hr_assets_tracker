import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Laptop, CheckCircle2, Clock } from "lucide-react";

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

      <div
        className="d-flex justify-content-between mx-3 mt-3"
        style={{ gap: "1rem" }}
      >
        {/* Employees Card */}
        <div
          className="card rounded p-3 text-white position-relative"
          style={{
            border: "none",
            flex: "1 1 22%",
            background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
            overflow: "hidden",
          }}
        >
          {/* Background Icon */}
          <Users
            size={100}
            className="position-absolute"
            style={{
              top: "60%",
              right: "10%",
              transform: "translateY(-50%)",
              opacity: 0.1,
              pointerEvents: "none",
            }}
          />

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Employees</h5>
            {/* <Users size={24} /> */}
          </div>
          <div
            style={{ fontSize: "2.5rem", fontWeight: "700", textAlign: "left" }}
          >
            128
          </div>
        </div>

        {/* Assets Card */}
        <div
          className="card rounded p-3 text-white position-relative"
          style={{
            flex: "1 1 22%",
            border: "none",
            backgroundColor: "#2ABB52",
            overflow: "hidden",
          }}
        >
          <Laptop
            size={100}
            className="position-absolute"
            style={{
              top: "60%",
              right: "10%",
              transform: "translateY(-50%)",
              opacity: 0.1,
              pointerEvents: "none",
            }}
          />

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Assets</h5>
            {/* <Laptop size={24} /> */}
          </div>
          <div
            style={{ fontSize: "2.5rem", fontWeight: "700", textAlign: "left" }}
          >
            325
          </div>
        </div>

        {/* Assigned Card */}
        <div
          className="card rounded p-3 text-white position-relative"
          style={{
            flex: "1 1 22%",
            border: "none",
            backgroundColor: "#FFD200",
            overflow: "hidden",
          }}
        >
          <CheckCircle2
            size={100}
            className="position-absolute"
            style={{
              top: "60%",
              right: "10%",
              transform: "translateY(-50%)",
              opacity: 0.1,
              pointerEvents: "none",
            }}
          />

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0" style={{ fontFamily: "unset" }}>
              Assigned
            </h5>
            {/* <CheckCircle2 size={24} /> */}
          </div>
          <div
            style={{ fontSize: "2.5rem", fontWeight: "700", textAlign: "left" }}
          >
            87
          </div>
        </div>

        {/* Pending Card */}
        <div
          className="card shadow rounded p-3 text-white position-relative"
          style={{
            border: "none",
            flex: "1 1 22%",
            background: "linear-gradient(135deg, #0250c5 0%, #d43f8d 100%)",
            overflow: "hidden",
          }}
        >
          <Clock
            size={100}
            className="position-absolute"
            style={{
              top: "60%",
              right: "10%",
              transform: "translateY(-50%)",
              opacity: 0.1,
              pointerEvents: "none",
            }}
          />

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Pending</h5>
            {/* <Clock size={24} /> */}
          </div>
          <div
            style={{ fontSize: "2.5rem", fontWeight: "700", textAlign: "left" }}
          >
            14
          </div>
        </div>
      </div>

      <div className="py-3 px-2 px-md-4">{/* Other content here */}</div>
    </main>
  );
};

export default Dashboard;
