import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Package,
  Share2,
  LogOut,
  SquareMenu,
  X,
  QrCodeIcon,
  Wrench,
} from "lucide-react";

const Layout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = {
    SUPER_ADMIN: [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={15} /> },
      { name: "Manage Admins", path: "/admin-management", icon: <UserCog size={15} /> },
      { name: "Employees", path: "/employee-management", icon: <Users size={15} /> },
      { name: "Assets", path: "/asset-management", icon: <Package size={15} /> },
      { name: "Allocation", path: "/asset-allocation", icon: <Share2 size={15} /> },
      { name: "Repair Requests", path: "/repair-requests", icon: <Wrench size={15} /> },
      { name: "Track Asset", path: "/track-asset", icon: <QrCodeIcon size={15} /> },
    ],
    ADMIN: [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={15} /> },
      { name: "Employees", path: "/employee-management", icon: <Users size={15} /> },
      { name: "Assets", path: "/asset-management", icon: <Package size={15} /> },
      { name: "Allocation", path: "/asset-allocation", icon: <Share2 size={15} /> },
      { name: "Repair Requests", path: "/repair-requests", icon: <Wrench size={15} /> },
      { name: "Track Asset", path: "/track-asset", icon: <QrCodeIcon size={15} /> },
    ],
    EMPLOYEE: [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={15} /> },
      { name: "My Assets", path: "/my-assets", icon: <Package size={15} /> },
      { name: "Repair Requests", path: "/repair-requests", icon: <Wrench size={15} /> },
      { name: "Track My Asset", path: "/track-asset", icon: <QrCodeIcon size={15} /> },
    ],
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("userData");
    if (!stored) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed.user || parsed);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  if (!user) return null;

  const roleKey = user.role?.toUpperCase();
  const items = menuItems[roleKey] || [];

  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    navigate("/login", { replace: true });
  };

  const sidebarStyle = {
    width: 250,
    backgroundColor: "#fff",
    borderRight: "1px solid #E5E7EB",
  };

  return (
    <div className="d-flex flex-column vh-100">
      {/* Desktop Sidebar */}
      <div className="d-none d-md-flex flex-grow-1">
        <aside className="d-flex flex-column text-dark" style={sidebarStyle}>
          <div className="p-2 border-bottom">
            <h4 className="mb-1">HR Assets</h4>
            <p className="text-muted mb-0">Tracker System</p>
          </div>

          <ul className="list-unstyled flex-grow-1 p-2 m-0">
            {items.map((item) => (
              <li key={item.path} className="mb-0">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `d-flex align-items-center p-2 text-decoration-none ${
                      isActive ? "bg-dark text-white fw-bold rounded" : "text-dark"
                    }`
                  }
                >
                  <span className="me-2">{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="p-3 border-top">
            <button
              className="btn w-100 border d-flex align-items-center justify-content-center"
              onClick={handleLogout}
            >
              <LogOut size={15} className="me-2" /> Logout
            </button>
          </div>
        </aside>

        <div className="flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="d-md-none flex-grow-1 d-flex flex-column">
        <nav className="d-flex align-items-center p-2 border-bottom bg-white">
          <button
            className="btn btn-transparent p-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <SquareMenu size={24} />
          </button>
        </nav>

        {isMobileMenuOpen && (
          <div
            className="position-fixed top-0 start-0 vh-100 bg-white shadow d-flex flex-column justify-content-between"
            style={{ width: 250, zIndex: 1050 }}
          >
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0">HR Assets</h5>
              <button
                className="btn btn-transparent p-0"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <ul className="list-unstyled p-2 flex-grow-1">
              {items.map((item) => (
                <li key={item.path} className="mb-2">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `d-flex align-items-center p-2 text-decoration-none ${
                        isActive ? "bg-dark text-white fw-bold rounded" : "text-dark"
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="me-2">{item.icon}</span>
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="p-3 border-top">
              <button
                className="btn w-100 border"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={15} className="me-2" /> Logout
              </button>
            </div>
          </div>
        )}

        <div className="flex-grow-1 overflow-auto p-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
