import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: "Total Students", value: 156, color: "#3498db" },
    { title: "Total Exams", value: 24, color: "#2ecc71" },
    { title: "Average Score", value: "78%", color: "#f39c12" },
    { title: "Active Sessions", value: 12, color: "#9b59b6" },
  ];

  const quickActions = [
    { title: "Add Student", path: "/admin/add-student", color: "#3498db" },
    { title: "View Students", path: "/admin/view-students", color: "#2ecc71" },
    { title: "Student Scores", path: "/admin/student-scores", color: "#f39c12" },
    { title: "Create Exam", path: "/admin/create-exam", color: "#9b59b6" },
  ];

  return (
    <div className="dashboard">
      <h1 className="page-title">Admin Dashboard Overview</h1>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <h3>{stat.title}</h3>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="action-card"
              style={{ backgroundColor: action.color }}
              onClick={() => navigate(action.path)}
            >
              {action.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;