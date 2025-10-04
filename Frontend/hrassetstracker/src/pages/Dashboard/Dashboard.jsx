import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Laptop,
  CheckCircle2,
  Clock,
  Trash2,
  Wrench,
  BadgeCheck,
  CircleAlert,
  Gauge,
} from "lucide-react";
import Header from "../Common/Header";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    const userData = sessionStorage.getItem("userData");
    if (!userData) {
      navigate("/login", { replace: true });
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser.user);

    const fetchCounts = async () => {
      try {
        let response;
        if (
          parsedUser.user.role === "SUPER_ADMIN" ||
          parsedUser.user.role === "ADMIN"
        ) {
          response = await fetch("http://127.0.0.1:8000/dashboard/counts");
        } else if (parsedUser.user.role === "EMPLOYEE") {
          response = await fetch(
            `http://127.0.0.1:8000/dashboard/assigned-assets-count/${parsedUser.user.id}`
          );
        }

        if (!response.ok) throw new Error("Failed to fetch counts");
        const data = await response.json();
        setCounts(data);
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };

    fetchCounts();
  }, [navigate]);

  if (!user) return null;

  return (
    <main className="flex-grow-1">
      {/* Header */}
   
      
      <Header></Header>

      {/* Welcome Section */}
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

      {/* admin dashbord*/}
      <div>
        {(user.role === "SUPER_ADMIN" || user.role === "ADMIN") && (
          <div className="row mx-2 g-3">
            {/* Employees */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card rounded p-3 text-white position-relative h-100"
                style={{
                  border: "none",
                  background:
                    "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                  overflow: "hidden",
                }}
              >
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
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {counts ? counts.active_employees : 0}
                </div>
              </div>
            </div>

            {/* Assets */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card rounded p-3 text-white position-relative h-100"
                style={{
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
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {counts ? counts.total_assets : 0}
                </div>
              </div>
            </div>

            {/* Assigned */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card rounded p-3 text-white position-relative h-100"
                style={{
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
                  <h5 className="mb-0">Assigned</h5>
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {counts ? counts.allocated_assets : 0}
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card shadow rounded p-3 text-white position-relative h-100"
                style={{
                  border: "none",
                  background:
                    "linear-gradient(135deg, #0250c5 0%, #d43f8d 100%)",
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
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {counts ? counts.pending_repair_requests : 0}
                </div>
              </div>
            </div>

            {/* E-Waste */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card rounded p-3 text-white position-relative h-100"
                style={{
                  border: "none",
                  backgroundColor: "#ff4d4d",
                  overflow: "hidden",
                }}
              >
                <Trash2
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
                  <h5 className="mb-0">E-Waste</h5>
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {counts ? counts.ewaste_assets : 0}
                </div>
              </div>
            </div>

            {/* In Repair */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card rounded p-3 text-white position-relative h-100"
                style={{
                  border: "none",
                  backgroundColor: "#ff9900",
                  overflow: "hidden",
                }}
              >
                <Wrench
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
                  <h5 className="mb-0">In Repair</h5>
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {counts ? counts.in_repair : 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        {user.role === "EMPLOYEE" && (
          <div className="row mx-2 mt-1 g-3">
            

            {/* Assigned Assets */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card rounded p-3 text-white position-relative h-100"
                style={{
                  border: "none",
                  backgroundColor: "#FFD200",
                  overflow: "hidden",
                }}
              >
                <Laptop
                  size={60}
                  className="position-absolute"
                  style={{
                    top: "60%",
                    right: "10%",
                    transform: "translateY(-50%)",
                    opacity: 0.5,
                    pointerEvents: "none",
                  }}
                />
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">Assigned</h5>
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {counts ? counts.assigned_assets_count : 0}
                </div>
              </div>
            </div>

            {/* Pending Repair Requests */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card shadow rounded p-3 text-white position-relative h-100"
                style={{
                  border: "none",
                  background:
                    "linear-gradient(135deg, #0250c5 0%, #d43f8d 100%)",
                  overflow: "hidden",
                }}
              >
                <CircleAlert
                  size={50}
                  className="position-absolute"
                  style={{
                    top: "60%",
                    right: "10%",
                    transform: "translateY(-50%)",
                    opacity: 0.5,
                    pointerEvents: "none",
                  }}
                />
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">Pending</h5>
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                  {counts ? counts.pending_repair_requests_count : 0}
                </div>
              </div>
            </div>


            {/* Employees */}
            <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card rounded p-3 text-white position-relative h-100"
                style={{
                  border: "none",
                  background:
                    "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                  overflow: "hidden",
                }}
              >
                <BadgeCheck
                  size={50}
                  className="position-absolute"
                  style={{
                    top: "60%",
                    right: "10%",
                    transform: "translateY(-50%)",
                    opacity: 0.5,
                    pointerEvents: "none",
                  }}
                />
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">Status</h5>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>Active</div>
              </div>
            </div>

            {/* demo card */}
            {/* <div className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className="card shadow rounded p-3 position-relative h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">Pending</h6>
                  <CircleAlert size={24} className="text-danger" />
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    marginTop: "10px",
                  }}
                >
                  {counts ? counts.pending_repair_requests_count : 0}
                </div>
              </div>
            </div> */}
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
