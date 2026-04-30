import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import MyBorrows from "./pages/MyBorrows";
import Profile from "./pages/Profile";
import DeviceManage from "./pages/admin/DeviceManage";
import UserManage from "./pages/admin/UserManage";
import AllBorrows from "./pages/admin/AllBorrows";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route index element={<Dashboard />} />
          <Route path="devices" element={<Devices />} />
          <Route path="my-borrows" element={<MyBorrows />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="admin/devices"
            element={
              <ProtectedRoute role="admin">
                <DeviceManage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute role="admin">
                <UserManage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/borrows"
            element={
              <ProtectedRoute role="admin">
                <AllBorrows />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
