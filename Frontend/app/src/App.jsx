import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterPage from './Pages/RegisterPage';
import Login from './Pages/LoginPage';
import './App.css';
import Navbar from "./Components/Navbar";
import OwnerDashboard from "./Pages/OwnerDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import ReaderDashboard from './Pages/ReaderDashboard';

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
    else {
      navigate("/")
    }
  }, []);

  return null;
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar onLogout={handleLogout} />
        <AuthRedirect />
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/reader-dashboard" element={<ReaderDashboard />} />

          {/* <Route path="*" element={<Navigate to="/login" />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;