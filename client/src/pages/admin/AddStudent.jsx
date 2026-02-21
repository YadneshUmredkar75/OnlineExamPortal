import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiHash,
  FiLock,
  FiBookOpen,
  FiPlusCircle,
  FiCheckCircle,
  FiMail,
  FiEye,
  FiEyeOff,
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiAlertCircle
} from "react-icons/fi";

const AddStudent = () => {
  const navigate = useNavigate();
  const [adminDepartment, setAdminDepartment] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    password: "",
    email: "",
  });

  const [students, setStudents] = useState([
    { id: 101, name: "John Doe", department: "IT", email: "john.doe@example.com", status: "active", joinDate: "2024-01-15" },
    { id: 102, name: "Jane Smith", department: "Computer Science", email: "jane.smith@example.com", status: "active", joinDate: "2024-02-20" },
    { id: 103, name: "Bob Wilson", department: "IT", email: "bob.wilson@example.com", status: "active", joinDate: "2024-03-10" },
    { id: 104, name: "Alice Johnson", department: "IT", email: "alice.j@example.com", status: "inactive", joinDate: "2024-01-05" },
  ]);

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const dept = localStorage.getItem("adminDepartment");
    
    if (userRole !== "admin" || !dept) {
      navigate("/");
    }
    setAdminDepartment(dept);
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    } else if (!/^[A-Z0-9]{4,10}$/.test(formData.studentId)) {
      newErrors.studentId = "ID must be 4-10 alphanumeric characters";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Check duplicate Student ID within admin's department
    const duplicate = students.some(
      (s) => s.id === parseInt(formData.studentId) && s.department === adminDepartment
    );
    if (duplicate) {
      newErrors.studentId = `ID already exists in ${adminDepartment}`;
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newStudent = {
        id: parseInt(formData.studentId),
        name: formData.name,
        department: adminDepartment,
        email: formData.email,
        status: "active",
        joinDate: new Date().toISOString().split('T')[0],
      };
      
      setStudents((prev) => [newStudent, ...prev]);
      setSuccessMessage(`Student added successfully to ${adminDepartment} department!`);

      setFormData({
        name: "",
        studentId: "",
        password: "",
        email: "",
      });

      setTimeout(() => setSuccessMessage(""), 4000);
    } else {
      setErrors(newErrors);
    }
    
    setIsSubmitting(false);
  };

  const getDepartmentDetails = () => {
    const departments = {
      "IT": { 
        icon: "🌐", 
        lightBg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        bg: "bg-purple-600",
        hoverBg: "hover:bg-purple-700",
        ring: "ring-purple-500"
      },
      "Computer Science": { 
        icon: "💻", 
        lightBg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        bg: "bg-blue-600",
        hoverBg: "hover:bg-blue-700",
        ring: "ring-blue-500"
      },
      "Information Technology": { 
        icon: "🌐", 
        lightBg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        bg: "bg-purple-600",
        hoverBg: "hover:bg-purple-700",
        ring: "ring-purple-500"
      },
      "Mechanical": { 
        icon: "⚙️", 
        lightBg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        bg: "bg-orange-600",
        hoverBg: "hover:bg-orange-700",
        ring: "ring-orange-500"
      },
      "Civil": { 
        icon: "🏗️", 
        lightBg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        bg: "bg-green-600",
        hoverBg: "hover:bg-green-700",
        ring: "ring-green-500"
      },
      "Electronics": { 
        icon: "⚡", 
        lightBg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        bg: "bg-yellow-600",
        hoverBg: "hover:bg-yellow-700",
        ring: "ring-yellow-500"
      },
    };
    return departments[adminDepartment] || { 
      icon: "📚", 
      lightBg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-700",
      bg: "bg-gray-600",
      hoverBg: "hover:bg-gray-700",
      ring: "ring-gray-500"
    };
  };

  const deptDetails = getDepartmentDetails();
  const departmentStudents = students.filter(s => s.department === adminDepartment);
  const activeStudents = departmentStudents.filter(s => s.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section with Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Student
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <FiUsers className="w-4 h-4" />
                Manage students in your department
              </p>
            </div>
            
            {/* Department Badge */}
            <div className={`px-6 py-3 ${deptDetails.lightBg} rounded-lg border ${deptDetails.border}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{deptDetails.icon}</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Your Department</p>
                  <p className={`text-lg font-semibold ${deptDetails.text}`}>{adminDepartment}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Department Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${deptDetails.lightBg} flex items-center justify-center`}>
                  <FiUsers className={`w-5 h-5 ${deptDetails.text}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{departmentStudents.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <FiTrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">{activeStudents}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departmentStudents.filter(s => s.joinDate?.startsWith('2024-03')).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className={`mb-6 p-4 ${deptDetails.lightBg} border ${deptDetails.border} rounded-lg`}>
          <div className="flex items-start gap-3">
            <FiBookOpen className={`w-5 h-5 ${deptDetails.text} mt-0.5`} />
            <div>
              <p className={`text-sm ${deptDetails.text} font-medium`}>
                Adding students to <span className="font-bold">{adminDepartment}</span> department
              </p>
              <p className="text-xs text-gray-600 mt-1">
                All new students will be automatically enrolled in this department's courses and exams
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-slideDown">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <FiCheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          {/* Form Header */}
          <div className={`px-6 py-4 border-b border-gray-200 ${deptDetails.lightBg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${deptDetails.bg} flex items-center justify-center`}>
                <FiPlusCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  New Student Registration
                </h2>
                <p className="text-sm text-gray-600">
                  Fill in the details below to add a new student
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className={`w-5 h-5 ${errors.name ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.name 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Student ID */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHash className={`w-5 h-5 ${errors.studentId ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.studentId 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="STU001"
                  />
                </div>
                {errors.studentId && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.studentId}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className={`w-5 h-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="student@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className={`w-5 h-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.password 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <FiEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Department (Read-only) */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <div className={`px-4 py-3 ${deptDetails.lightBg} border ${deptDetails.border} rounded-lg`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{deptDetails.icon}</span>
                    <div>
                      <span className={`font-medium ${deptDetails.text}`}>{adminDepartment}</span>
                      <p className="text-xs text-gray-500 mt-0.5">Department is auto-assigned based on your admin role</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 ${deptDetails.bg} text-white font-medium rounded-lg ${deptDetails.hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${deptDetails.ring} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding Student...
                  </>
                ) : (
                  <>
                    <FiPlusCircle className="w-5 h-5" />
                    Add Student to {adminDepartment}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Students List */}
        {departmentStudents.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {adminDepartment} Students
                    </h3>
                    <p className="text-sm text-gray-600">
                      Recently added students in your department
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 ${deptDetails.lightBg} ${deptDetails.text} rounded-lg text-sm font-medium`}>
                  {departmentStudents.length} Total
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departmentStudents.slice(0, 5).map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-lg ${deptDetails.lightBg} flex items-center justify-center mr-3`}>
                            <span className={`text-sm font-medium ${deptDetails.text}`}>
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.joinDate || "2024-03-15"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          student.status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {student.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {departmentStudents.length > 5 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  View all {departmentStudents.length} students →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Animation Keyframes - Add to your CSS */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddStudent;