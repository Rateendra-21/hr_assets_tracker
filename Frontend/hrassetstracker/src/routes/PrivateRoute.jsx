import toast from "react-hot-toast";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const userData = sessionStorage.getItem("userData");

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  const parsed = JSON.parse(userData);
  const user = parsed.user || parsed;

  // role-based restriction
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // toast.success("Trying to acess unauthorised code")
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;

