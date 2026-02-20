import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  FileText, 
  Building2, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  GraduationCap,
  UserCog,
  Shield,
  Menu
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "admins", label: "Admin Management", icon: UserCog },
    { id: "students", label: "Student Data", icon: GraduationCap },
    { id: "departments", label: "Department Results", icon: Building2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div 
      className={`${
        sidebarOpen ? 'w-72' : 'w-20'
      } bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 min-h-screen shadow-2xl fixed left-0 top-0 z-50`}
    >
      {/* Logo Section */}
      <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
        {sidebarOpen ? (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
              ExamPortal
            </span>
          </div>
        ) : (
          <div className="p-2 bg-blue-500 rounded-lg mx-auto">
            <Shield className="w-6 h-6 text-white" />
          </div>
        )}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${
                sidebarOpen ? 'space-x-3 px-4' : 'justify-center px-2'
              } py-3 rounded-xl transition-all duration-200 group relative ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${sidebarOpen ? '' : 'mx-auto'}`} />
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
              {activeTab === item.id && (
                <div className="absolute right-0 w-1 h-8 bg-white rounded-l-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700/50">
        <button
          className={`w-full flex items-center ${
            sidebarOpen ? 'space-x-3 px-4' : 'justify-center'
          } py-3 rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group`}
        >
          <LogOut className={`w-5 h-5 ${sidebarOpen ? '' : 'mx-auto'}`} />
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          {!sidebarOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Logout
            </div>
          )}
        </button>

        {sidebarOpen && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <img 
                src={`https://ui-avatars.com/api/?name=Super+Admin&background=0D8F81&color=fff&size=40`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full ring-2 ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Super Admin</p>
                <p className="text-xs text-gray-400 truncate">admin@examportal.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;