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
  History,
} from "lucide-react";

const Layout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userData = sessionStorage.getItem("userData");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) return null;

  const menuItems = {
    SUPER_ADMIN: [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={15} /> },
      { name: "Manage Admins", path: "/admin-management", icon: <UserCog size={15} /> },
      { name: "Users", path: "/employee-management", icon: <Users size={15} /> },
      { name: "Assets", path: "/asset-management", icon: <Package size={15} /> },
      { name: "Asset Lifecycle", path: "/asset-lifecycle", icon: <History size={15} /> },
      { name: "Allocation", path: "/asset-allocation", icon: <Share2 size={15} /> },
      { name: "Repair Requests", path: "/repair-requests", icon: <Wrench size={15} /> },
      { name: "Track Asset", path: "/track-asset", icon: <QrCodeIcon size={15} /> },
    ],
    ADMIN: [
      { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={15} /> },
      { name: "Employees", path: "/employee-management", icon: <Users size={15} /> },
      { name: "Assets", path: "/asset-management", icon: <Package size={15} /> },
      { name: "Asset Lifecycle", path: "/asset-lifecycle", icon: <History size={15} /> },
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

  const items = menuItems[user.role?.toUpperCase()] || []; // ADDED: Use role instead of employee_type

  const handleLogout = () => {
    sessionStorage.removeItem("userData");
    navigate("/login");
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="d-flex flex-column vh-100">
      {/* Desktop Sidebar */}
      <div className="d-none d-md-flex flex-grow-1">
        <aside
          className="d-flex flex-column text-dark"
          style={{
            width: "250px",
            backgroundColor: "white",
            borderRight: "1px solid #E5E7EB",
          }}
        >
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
              className="btn w-100 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "transparent",
                border: "1px solid black",
                color: "black",
              }}
              onClick={handleLogout}
            >
              <LogOut size={15} className="me-2" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </div>

      {/* Mobile Navbar + Sidebar */}
      <div className="d-md-none flex-grow-1 d-flex flex-column">
        {/* Navbar */}
        <nav className="d-flex align-items-center p-2 border-bottom bg-white">
          <button
            className="btn btn-transparent p-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <SquareMenu size={24} />
          </button>
        </nav>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div
            className="position-fixed top-0 start-0 vh-100 bg-white shadow d-flex flex-column justify-content-between"
            style={{ width: "250px", zIndex: 1050 }}
          >
            {/* Header with Title and Close */}
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0">HR Assets</h5>
              <button className="btn btn-transparent p-0" onClick={closeMobileMenu}>
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
                    onClick={closeMobileMenu}
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
                  closeMobileMenu();
                  handleLogout();
                }}
              >
                <LogOut size={15} className="me-2" />
                Logout
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
