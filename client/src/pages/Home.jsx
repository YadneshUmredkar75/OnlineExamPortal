import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api"; // make sure path is correct

const Home = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("CSE");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const departments = ["CSE", "Mechanical", "Civil", "IT", "Electronics"];

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      let response;

      // ================= STUDENT LOGIN =================
      if (role === "student") {
        if (
          !formData.fullName ||
          !formData.email ||
          !formData.password ||
          !department
        ) {
          return alert("All fields are required");
        }

        response = await API.post("/auth/student/login", {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
          department,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", "student");

        navigate("/student/dashboard");
      }

      // ================= ADMIN LOGIN =================
      if (role === "admin") {
        if (!formData.email || !formData.password || !department) {
          return alert("All fields are required");
        }

        response = await API.post("/auth/admin/login", {
          email: formData.email.trim(),
          password: formData.password.trim(),
          department,
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", "admin");

        navigate("/admin/dashboard");
      }

      // ================= SUPER ADMIN LOGIN =================
      if (role === "superadmin") {
        if (!formData.email || !formData.password) {
          return alert("All fields are required");
        }

        response = await API.post("/auth/login", {
          email: formData.email.trim(),
          password: formData.password.trim(),
        });

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userRole", "superadmin");

        navigate("/superadmin/dashboard");
      }

    } catch (error) {
      console.error("Login Error:", error.response?.data);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Role Based Login
        </h1>

        {/* ROLE BUTTONS */}
        <div className="flex justify-between mb-6">
          <button
            onClick={() => setRole("student")}
            className={`px-3 py-2 rounded ${
              role === "student"
                ? "bg-green-600 text-white"
                : "bg-green-200"
            }`}
          >
            Student
          </button>

          <button
            onClick={() => setRole("admin")}
            className={`px-3 py-2 rounded ${
              role === "admin"
                ? "bg-blue-600 text-white"
                : "bg-blue-200"
            }`}
          >
            Admin
          </button>

          <button
            onClick={() => setRole("superadmin")}
            className={`px-3 py-2 rounded ${
              role === "superadmin"
                ? "bg-purple-600 text-white"
                : "bg-purple-200"
            }`}
          >
            Super Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Department Dropdown (Student + Admin) */}
          {(role === "student" || role === "admin") && (
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}

          {/* Full Name (Student Only) */}
          {role === "student" && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border p-2 rounded"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
            />
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <button className="w-full bg-black text-white p-2 rounded hover:opacity-90">
            Login as {role}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;