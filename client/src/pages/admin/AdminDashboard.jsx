import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiMonitor,
  FiPlusCircle,
  FiEye,
  FiAward,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";  // ← fixed: added this import

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminDepartment, setAdminDepartment] = useState("Loading...");

  useEffect(() => {
    const dept = localStorage.getItem("adminDepartment");
    if (dept) {
      setAdminDepartment(dept);
    } else {
      setAdminDepartment("Not Set");
    }
  }, []);

  // Stats (dummy – can be replaced with real data later)
  const stats = [
    {
      title: "Total Students",
      value: 156,
      icon: FiUsers,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Exams Created",
      value: 24,
      icon: FiFileText,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Average Score",
      value: "78%",
      icon: FiAward,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Active Sessions",
      value: 12,
      icon: FiMonitor,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  // Quick Actions
  const quickActions = [
    {
      title: "Add New Student",
      path: "/admin/add-student",
      icon: FiPlusCircle,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "View Students",
      path: "/admin/view-students",
      icon: FiUsers,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Student Scores",
      path: "/admin/student-scores",
      icon: FiTrendingUp,
      color: "bg-amber-600 hover:bg-amber-700",
    },
    {
      title: "Create Exam",
      path: "/admin/create-exam",
      icon: FiFileText,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  // Recent activity (dummy data)
  const recentActivity = [
    { text: "Added 5 new students to Computer Science", time: "2 hours ago" },
    { text: "Created Mathematics Mid-Term Exam", time: "Yesterday" },
    { text: "Updated scores for Data Structures batch", time: "3 days ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Welcome, Admin
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Managing <span className="font-semibold text-blue-600">{adminDepartment}</span> Department
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow ${stat.bg}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color} opacity-80`} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <FiPlusCircle className="text-blue-600 w-7 h-7" />
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className={`group flex flex-col items-center justify-center p-6 rounded-xl text-white font-medium transition-all transform hover:scale-105 shadow-md ${action.color}`}
              >
                <action.icon className="w-10 h-10 mb-3" />
                <span className="text-center text-lg">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <FiTrendingUp className="text-green-600 w-7 h-7" />
            Recent Activity
          </h2>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex-shrink-0 mt-1">
                  <FaCheckCircle className="text-green-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{activity.text}</p>
                  <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}

            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recent activity to show
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;