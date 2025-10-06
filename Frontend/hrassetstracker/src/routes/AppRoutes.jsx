import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Layout from "../pages/layout/Layout"; // Sidebar Layout
import Admin from "../pages/Admin/admin";
import Employee from "../pages/employee/employee";
import Assets from "../pages/Assets/Assets";
import Allocation from "../pages/Allocations/Allocation";
import TrackAsset from "../pages/Common/TrackAsset";
import EmployeeAsset from "../pages/employee/EmployeeAsset";
import RepairRequests from "../pages/Repairs/RepairRequests";
import AssetLifecycle from "../pages/Assets/AssetLifecycle";
// import EwasteDisposal from "../pages/Assets/EwasteDisposal";

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("userData") || "null");
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const isLoggedIn = !!sessionStorage.getItem("userData");

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }
      />

      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin-management" element={<Admin />} />
        <Route path="employee-management" element={<Employee />} />
        <Route path="asset-management" element={<Assets />} />
        <Route path="asset-allocation" element={<Allocation />} />
        <Route path="track-asset" element={<TrackAsset />} />
        <Route path="my-assets" element={<EmployeeAsset />} />
        <Route path="repair-requests" element={<RepairRequests />} />
        <Route path="asset-lifecycle" element={<AssetLifecycle />} />
        {/* <Route path="ewaste-disposal" element={<EwasteDisposal />} /> */}



      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;

// import { Routes, Route, Navigate } from "react-router-dom";
// import TrackAsset from "../pages/Common/TrackAsset"; // import TrackAsset component

// const AppRoutes = () => {
//   return (
//     <Routes>
//       {/* Default route renders TrackAsset */}
//       <Route path="/test" element={<TrackAsset />} />

//       {/* Optional: catch-all redirects to TrackAsset */}
//       <Route path="*" element={<Navigate to="/" />} />
//     </Routes>
//   );
// };

// export default AppRoutes;
