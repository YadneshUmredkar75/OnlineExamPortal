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

  const departments = ["Computer Science", "Mechanical", "Civil", "IT"];

  const handleLogin = (e) => {
    e.preventDefault();

    if (role === "superadmin") {
      localStorage.setItem("token", "superadmin_token");
      localStorage.setItem("userRole", "superadmin");
      navigate("/superadmin/dashboard");
    }

    if (role === "admin") {
      if (!department) return alert("Select department");
      localStorage.setItem("token", "admin_token");
      localStorage.setItem("userRole", "admin");
      navigate("/admin/dashboard");
    }

    if (role === "student") {
      if (!department) return alert("Select department");
      localStorage.setItem("token", "student_token");
      localStorage.setItem("userRole", "student");
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
          <button onClick={() => setRole("superadmin")}
            className="bg-purple-500 text-white px-4 py-2 rounded">
            Super Admin
          </button>

          <button onClick={() => setRole("admin")}
            className="bg-blue-500 text-white px-4 py-2 rounded">
            Admin
          </button>

          <button onClick={() => setRole("student")}
            className="bg-green-500 text-white px-4 py-2 rounded">
            Student
          </button>
        </div>

        {/* LOGIN FORM */}
        {role && (
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Department (Only for Admin & Student) */}
            {(role === "admin" || role === "student") && (
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border p-3 rounded"
              >
                <option value="">Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}

            {/* Super Admin */}
            {role === "superadmin" && (
              <>
                <input
                  type="email"
                  placeholder="Super Admin Email"
                  className="w-full border p-3 rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border p-3 rounded"
                  required
                />
              </>
            )}

            {/* Admin */}
            {role === "admin" && (
              <>
                <input
                  type="email"
                  placeholder="Admin Email"
                  className="w-full border p-3 rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border p-3 rounded"
                  required
                />
              </>
            )}

            {/* Student */}
            {role === "student" && (
              <>
                <input
                  type="text"
                  placeholder="Student ID"
                  className="w-full border p-3 rounded"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border p-3 rounded"
                  required
                />
              </>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white p-3 rounded hover:bg-gray-800"
            >
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Home;
