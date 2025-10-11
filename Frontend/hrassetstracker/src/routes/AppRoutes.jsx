import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Layout from "../pages/layout/Layout";
import Admin from "../pages/Admin/admin";
import Employee from "../pages/employee/employee";
import Assets from "../pages/Assets/Assets";
import Allocation from "../pages/Allocations/Allocation";
import TrackAsset from "../pages/Common/TrackAsset";
import EmployeeAsset from "../pages/employee/EmployeeAsset";
import RepairRequests from "../pages/Repairs/RepairRequests";
import AssetLifecycle from "../pages/Assets/AssetLifecycle";
import PrivateRoute from "./PrivateRoute";
import ConfirmAdmin from "../pages/Common/ConfirmAdmin"
import ConfirmEmployee from "../pages/Common/ConfirmEmployee";
const AppRoutes = () => {
  const isLoggedIn = !!sessionStorage.getItem("userData");

  return (
    <Routes>
      {/* Redirect root */}
      <Route
        path="/"
        element={
          isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/confirm-admin" element={<ConfirmAdmin />} />
      <Route path="/Confirm-Employee" element={< ConfirmEmployee/>}/>

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "EMPLOYEE"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* SUPER_ADMIN only */}
        <Route
          path="admin-management"
          element={
            <PrivateRoute allowedRoles={["SUPER_ADMIN"]}>
              <Admin />
            </PrivateRoute>
          }
        />

        {/* ADMIN & SUPER_ADMIN */}
        <Route
          path="employee-management"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <Employee />
            </PrivateRoute>
          }
        />
        <Route
          path="asset-management"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <Assets />
            </PrivateRoute>
          }
        />
        <Route
          path="asset-allocation"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
              <Allocation />
            </PrivateRoute>
          }
        />

        {/* Common to all roles */}
        <Route
          path="dashboard"
          element={
            <PrivateRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "EMPLOYEE"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="repair-requests"
          element={
            <PrivateRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "EMPLOYEE"]}>
              <RepairRequests />
            </PrivateRoute>
          }
        />

        <Route
          path="track-asset"
          element={
            <PrivateRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "EMPLOYEE"]}>
              <TrackAsset />
            </PrivateRoute>
          }
        />

        {/* EMPLOYEE only */}
        <Route
          path="my-assets"
          element={
            <PrivateRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeAsset />
            </PrivateRoute>
          }
        />

        {/* Optional */}
        <Route
          path="asset-lifecycle"
          element={
            <PrivateRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
              <AssetLifecycle />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
