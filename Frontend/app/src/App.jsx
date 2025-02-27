import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterPage from './Pages/RegisterPage';
import Login from './Pages/LoginPage';
import './App.css';
import Navbar from "./Components/Navbar";
import OwnerDashboard from "./Pages/OwnerDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import ReaderDashboard from './Pages/ReaderDashboard';
import HomePage from "./Pages/Homepage";


// import ManageLibraries from "./Pages/Owner/ManageLibraries";
// import ManageAdmins from "./Pages/Owner/ManageAdmins";
// import ManageBooks from "./Pages/Admin/ManageBooks";
// import IssueRequests from "./Pages/Admin/IssueRequests";
// import ReaderManagement from "./Pages/Admin/ReaderManagement";
// import SearchBooks from "./Pages/Reader/SearchBooks";
// import MyBooks from "./Pages/Reader/MyBooks";
// import IssueHistory from "./Pages/Reader/IssueHistory";

function getRoleFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = getRoleFromToken();

  if (!role) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "owner") return <Navigate to="/owner-dashboard" replace />;
    if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (role === "reader") return <Navigate to="/reader-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

//Logout Function
function handleLogout(navigate) {
  localStorage.removeItem("token");
  navigate("/");
}

function AuthRedirect() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userRole = getRoleFromToken();
    setRole(userRole);

    if (userRole === "owner") {
      navigate("/owner-dashboard");
    } else if (userRole === "admin") {
      navigate("/admin-dashboard");
    } else if (userRole === "reader") {
      navigate("/reader-dashboard");
    }
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar onLogout={handleLogout} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<Login />} />

        {/* Owner routes */}
        <Route path="/owner-dashboard" element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        {/* <Route path="/manage-libraries" element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <ManageLibraries />
          </ProtectedRoute>
        } /> */}
        {/* <Route path="/manage-admins" element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <ManageAdmins />
          </ProtectedRoute>
        } /> */}

        {/* Admin routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        {/* <Route path="/manage-books" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ManageBooks />
          </ProtectedRoute>
        } />
        <Route path="/issue-requests" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <IssueRequests />
          </ProtectedRoute>
        } /> */}
        {/* <Route path="/reader-management" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ReaderManagement />
          </ProtectedRoute>
        } /> */}

        {/* Reader routes */}
        <Route path="/reader-dashboard" element={
          <ProtectedRoute allowedRoles={["reader"]}>
            <ReaderDashboard />
          </ProtectedRoute>
        } />
        {/* <Route path="/search-books" element={
          <ProtectedRoute allowedRoles={["reader"]}>
            <SearchBooks />
          </ProtectedRoute>
        } /> */}
        {/* <Route path="/my-books" element={
          <ProtectedRoute allowedRoles={["reader"]}>
            <MyBooks />
          </ProtectedRoute>
        } />
        <Route path="/issue-history" element={
          <ProtectedRoute allowedRoles={["reader"]}>
            <IssueHistory />
          </ProtectedRoute>
        } /> */}

        {/* Fallback route */}
        <Route path="*" element={<AuthRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;