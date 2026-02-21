import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    studentId: "",
  });

  const departments = ["Computer Science", "Mechanical", "Civil", "IT", "Electronics"];

  const handleLogin = (e) => {
    e.preventDefault();

    if (role === "superadmin") {
      localStorage.setItem("token", "superadmin_token");
      localStorage.setItem("userRole", "superadmin");
      navigate("/superadmin/dashboard");
    }

    if (role === "admin") {
      if (!department) {
        alert("Please select your department");
        return;
      }
      localStorage.setItem("token", "admin_token");
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("adminDepartment", department); // Store admin's department
      navigate("/admin/dashboard");
    }

    if (role === "student") {
      if (!department) {
        alert("Please select your department");
        return;
      }
      localStorage.setItem("token", "student_token");
      localStorage.setItem("userRole", "student");
      localStorage.setItem("studentDepartment", department); // Store student's department
      navigate("/student/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-6">
          Role Based Login
        </h1>

        {/* ROLE BUTTONS */}
        <div className="flex justify-between mb-6">
          <button 
            onClick={() => setRole("superadmin")}
            className={`px-4 py-2 rounded transition-colors ${
              role === "superadmin" 
                ? "bg-purple-600 text-white" 
                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            }`}
          >
            Super Admin
          </button>

          <button 
            onClick={() => setRole("admin")}
            className={`px-4 py-2 rounded transition-colors ${
              role === "admin" 
                ? "bg-blue-600 text-white" 
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            Admin
          </button>

          <button 
            onClick={() => setRole("student")}
            className={`px-4 py-2 rounded transition-colors ${
              role === "student" 
                ? "bg-green-600 text-white" 
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            Student
          </button>
        </div>

        {/* LOGIN FORM */}
        {role && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Department Selection for Admin & Student */}
            {(role === "admin" || role === "student") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose Department</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Super Admin Login Fields */}
            {role === "superadmin" && (
              <>
                <input
                  type="email"
                  placeholder="Super Admin Email"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </>
            )}

            {/* Admin Login Fields */}
            {role === "admin" && (
              <>
                <input
                  type="email"
                  placeholder="Admin Email"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </>
            )}

            {/* Student Login Fields */}
            {role === "student" && (
              <>
                <input
                  type="text"
                  placeholder="Student ID"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </>
            )}

            <button
              type="submit"
              className={`w-full text-white p-3 rounded-lg hover:opacity-90 transition-opacity ${
                role === "superadmin" ? "bg-purple-600" :
                role === "admin" ? "bg-blue-600" : "bg-green-600"
              }`}
            >
              Login as {role === "superadmin" ? "Super Admin" : role === "admin" ? "Admin" : "Student"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Home;