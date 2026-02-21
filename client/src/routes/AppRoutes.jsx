import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Remove BrowserRouter import
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import Home from "../pages/Home";
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentDashboard from "../pages/student/StudentDashboard";
import AddStudent from "../pages/admin/AddStudent";
import ViewStudents from "../pages/admin/ViewStudents";
import StudentScores from "../pages/admin/StudentScores";
import CreateExam from "../pages/admin/CreateExam";



/* ================= PROTECTED ROUTE ================= */

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  // Debug logs (remove in production)
  console.log("Protected Route Check:", {
    token: !!token,
    userRole,
    allowedRoles,
    userData
  });

  if (!token) {
    console.log("No token found, redirecting to login");
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log(`Role ${userRole} not allowed. Allowed: ${allowedRoles}`);
    return <Navigate to="/" replace />;
  }

  return children;
};

/* ================= ADMIN LAYOUT ================= */

const AdminLayout = ({ children }) => {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <TopNavbar />
        <div className="page-container">
          {children}
        </div>
      </div>
    </div>
  );
};

/* ================= ROUTES ================= */

const AppRouter = () => {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Home />} />

      {/* Super Admin Routes */}
      <Route
        path="/superadmin/*"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      

      <Route
        path="/superadmin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/superadmin/admins"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/superadmin/students"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/superadmin/departments"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/superadmin/audit"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/superadmin/monitoring"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/superadmin/settings"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />


      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />

          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/add-student"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <AddStudent />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/view-students"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <ViewStudents />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/student-scores"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <StudentScores />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/create-exam"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <CreateExam />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Student Route */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter;