import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import Home from "../pages/Home";
import SuperAdminDashboard from "../pages/superadmin/SuperAdminDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentDashboard from "../pages/student/StudentDashboard";
import ResultsPage from "../pages/student/StudentResults";
import AddStudent from "../pages/admin/AddStudent";
import ViewStudents from "../pages/admin/ViewStudents";
import StudentScores from "../pages/admin/StudentScores";
import CreateExam from "../pages/admin/CreateExam";
import StudentResults from "../pages/student/StudentResults";

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

      {/* Admin Routes - Public */}
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      
      <Route path="/admin/add-student" element={
        <AdminLayout>
          <AddStudent />
        </AdminLayout>
      } />

      <Route path="/admin/view-students" element={
        <AdminLayout>
          <ViewStudents />
        </AdminLayout>
      } />

      <Route path="/admin/student-scores" element={
        <AdminLayout>
          <StudentScores />
        </AdminLayout>
      } />

      <Route path="/admin/create-exam" element={
        <AdminLayout>
          <CreateExam />
        </AdminLayout>
      } />

      {/* Student Routes - Public */}
      <Route path="/student/*" element={<StudentDashboard />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/results" element={< StudentResults />} />

      {/* <Route path="/student/results" element={
        <StudentLayout>
          <ResultsPage />
        </StudentLayout>
      } /> */}
      
      <Route path="/student/profile" element={
        <StudentLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Student Profile</h1>
            {/* Profile component will go here */}
          </div>
        </StudentLayout>
      } />

      <Route path="/student/schedule" element={
        <StudentLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Exam Schedule</h1>
            {/* Schedule component will go here */}
          </div>
        </StudentLayout>
      } />

      <Route path="/student/analytics" element={
        <StudentLayout>
          <div className="p-6">
            <h1 className="text-2xl font-bold">Performance Analytics</h1>
            {/* Analytics component will go here */}
          </div>
        </StudentLayout>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter;