import React, { useState } from "react";
import Sidebar from "../../components/superadmin/Sidebar";
import DashboardContent from "./components/DashboardContent";
import AdminManagement from "./components/AdminManagement";
import StudentData from "./components/StudentData";
import DepartmentResults from "./components/DepartmentResults";
import Settings from "./components/Settings";

const SuperAdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch(activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "admins":
        return <AdminManagement />;
      case "students":
        return <StudentData />;
      case "departments":
        return <DepartmentResults />;
      case "settings":
        return <Settings />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;