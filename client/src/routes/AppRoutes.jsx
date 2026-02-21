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

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) return <Navigate to="/" replace />;
  if (role && role !== userRole) return <Navigate to="/" replace />;

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
      {/* Public Route */}
      <Route path="/" element={<Home />} />

      {/* Super Admin Route */}
      <Route
        path="/superadmin/dashboard"
        element={
          <ProtectedRoute role="superadmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes with Layout */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
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
          <ProtectedRoute role="student">
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