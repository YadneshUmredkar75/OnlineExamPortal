import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import Home from "../pages/Home";
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentResults from "../pages/student/StudentResults";
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

/* ================= STUDENT LAYOUT ================= */

const StudentLayout = ({ children }) => {
  return (
    <div className="app">
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
      {/* Public Routes - All routes are public now */}
      <Route path="/" element={<Home />} />

      {/* Super Admin Routes - Public */}
      <Route path="/superadmin/*" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/admins" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/students" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/departments" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/audit" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/monitoring" element={<SuperAdminDashboard />} />
      <Route path="/superadmin/settings" element={<SuperAdminDashboard />} />

      {/* Admin Routes - All with AdminLayout */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/add-student"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <AddStudent />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route 
        path="/admin/view-students" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <ViewStudents />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/student-scores" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <StudentScores />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/create-exam" 
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout>
              <CreateExam />
            </AdminLayout>
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
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Student Results Route with Layout */}
      <Route 
        path="/student/results" 
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout>
              <StudentResults />
            </StudentLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/student/profile" 
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Student Profile</h1>
                {/* Profile component will go here */}
              </div>
            </StudentLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/student/schedule" 
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Exam Schedule</h1>
                {/* Schedule component will go here */}
              </div>
            </StudentLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/student/analytics" 
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Performance Analytics</h1>
                {/* Analytics component will go here */}
              </div>
            </StudentLayout>
          </ProtectedRoute>
        } 
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter;