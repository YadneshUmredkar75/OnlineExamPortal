import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaSearch,
  FaFilter,
  FaKey,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserGraduate,
  FaEnvelope,
  FaIdCard,
  FaBuilding,
  FaChevronDown,
  FaChevronUp,
  FaMoon,
  FaSun,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaCog
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

// Modal Component
const Modal = ({ title, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(initialData || { name: "", department: "", email: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <FaEdit className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {title}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ""}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const ViewStudents = () => {
  const navigate = useNavigate();
  const [adminDepartment, setAdminDepartment] = useState("");
  const [userRole, setUserRole] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedMobileRows, setExpandedMobileRows] = useState({});
  
  const [students, setStudents] = useState([
    { id: 101, name: "John Doe", department: "IT", password: "john123", email: "john.doe@example.com", status: "active" },
    { id: 102, name: "Jane Smith", department: "IT", password: "jane456", email: "jane.smith@example.com", status: "active" },
    { id: 103, name: "Bob Wilson", department: "IT", password: "bob789", email: "bob.wilson@example.com", status: "inactive" },
    { id: 104, name: "Alice Johnson", department: "IT", password: "alice123", email: "alice.j@example.com", status: "active" },
    { id: 105, name: "Charlie Brown", department: "IT", password: "charlie123", email: "charlie@example.com", status: "active" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const dept = localStorage.getItem("adminDepartment");
    
    setUserRole(role);
    
    if (role !== "admin") {
      navigate("/");
      return;
    }

    if (!dept) {
      navigate("/");
      return;
    }

    setAdminDepartment(dept);
  }, [navigate]);

  // Toggle mobile row expansion
  const toggleMobileRow = (studentId) => {
    setExpandedMobileRows(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const filteredStudents = students.filter((student) => {
    if (student.department !== adminDepartment) {
      return false;
    }

    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toString().includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === "" ||
      statusFilter === "All" ||
      student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id) => {
    setStudents((prev) => prev.filter((student) => student.id !== id));
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  const handleUpdate = (updatedStudent) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s))
    );
    setEditingStudent(null);
  };

  const handlePasswordChange = (student) => {
    setSelectedStudent(student);
    setShowPasswordModal(true);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
  };

  const validatePassword = () => {
    if (!newPassword) {
      setPasswordError("Password is required");
      return false;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handlePasswordSubmit = () => {
    if (!validatePassword()) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id ? { ...s, password: newPassword } : s
      )
    );

    setPasswordSuccess("Password updated successfully!");
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess("");
      setSelectedStudent(null);
    }, 2000);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const activeFilters = [searchTerm, statusFilter].filter(f => f && f !== "All" && f !== "").length;

  const getDepartmentDetails = () => {
    const departments = {
      "IT": { bg: "bg-purple-100", text: "text-purple-800", icon: "🌐", lightBg: "bg-purple-50", border: "border-purple-200", gradient: "from-purple-500 to-purple-600" },
      "Computer Science": { bg: "bg-blue-100", text: "text-blue-800", icon: "💻", lightBg: "bg-blue-50", border: "border-blue-200", gradient: "from-blue-500 to-blue-600" },
      "Information Technology": { bg: "bg-purple-100", text: "text-purple-800", icon: "🌐", lightBg: "bg-purple-50", border: "border-purple-200", gradient: "from-purple-500 to-purple-600" },
      "Mechanical": { bg: "bg-orange-100", text: "text-orange-800", icon: "⚙️", lightBg: "bg-orange-50", border: "border-orange-200", gradient: "from-orange-500 to-orange-600" },
      "Civil": { bg: "bg-green-100", text: "text-green-800", icon: "🏗️", lightBg: "bg-green-50", border: "border-green-200", gradient: "from-green-500 to-green-600" },
      "Electronics": { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⚡", lightBg: "bg-yellow-50", border: "border-yellow-200", gradient: "from-yellow-500 to-yellow-600" },
    };
    return departments[adminDepartment] || { bg: "bg-gray-100", text: "text-gray-800", icon: "📚", lightBg: "bg-gray-50", border: "border-gray-200", gradient: "from-gray-500 to-gray-600" };
  };

  const deptDetails = getDepartmentDetails();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
   

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome, Admin
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Manage students in {adminDepartment} department
          </p>
        </div>

        {/* Stats Cards - Mobile Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Students</p>
            <p className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {filteredStudents.length}
            </p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active</p>
            <p className="text-xl md:text-2xl font-bold text-green-600">
              {filteredStudents.filter(s => s.status === "active").length}
            </p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Inactive</p>
            <p className="text-xl md:text-2xl font-bold text-gray-400">
              {filteredStudents.filter(s => s.status === "inactive").length}
            </p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Department</p>
            <p className={`text-xl md:text-2xl font-bold ${deptDetails.text}`}>{adminDepartment}</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-3">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <span className="flex items-center gap-2">
                <FaFilter className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>Filters</span>
                {activeFilters > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {activeFilters} active
                  </span>
                )}
              </span>
              {isMobileFilterOpen ? (
                <FaChevronUp className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              ) : (
                <FaChevronDown className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              )}
            </button>
          </div>

          {/* Filters */}
          <div className={`${isMobileFilterOpen ? 'block' : 'hidden'} md:block`}>
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFilters > 0 && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <FaTimes className="w-3 h-3" />
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Students List - Desktop Table View */}
        <div className="hidden md:block">
          <div className={`rounded-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 ${deptDetails.bg} rounded-lg flex items-center justify-center`}>
                          <span className={`${deptDetails.text} font-medium`}>{student.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${deptDetails.bg} ${deptDetails.text}`}>
                        {student.department}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {student.email}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit student"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePasswordChange(student)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Change password"
                        >
                          <FaKey className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToDelete(student);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete student"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <FaUserGraduate className={`w-16 h-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-3`} />
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>No students found</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No students in {adminDepartment} department match your criteria
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredStudents.map((student) => (
            <div key={student.id} className={`rounded-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              {/* Card Header - Always Visible */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 h-12 w-12 ${deptDetails.bg} rounded-lg flex items-center justify-center`}>
                      <span className={`${deptDetails.text} font-medium text-lg`}>{student.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID: {student.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMobileRow(student.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedMobileRows[student.id] ? (
                      <FaChevronUp className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    ) : (
                      <FaChevronDown className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    )}
                  </button>
                </div>

                {/* Quick Info - Always Visible */}
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${deptDetails.bg} ${deptDetails.text}`}>
                    {student.department}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {student.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Expandable Details */}
              {expandedMobileRows[student.id] && (
                <div className={`px-4 pb-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{student.email}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(student)}
                        className="flex-1 flex items-center justify-center gap-2 p-2 text-blue-600 bg-blue-50 rounded-lg"
                      >
                        <FaEdit className="w-4 h-4" />
                        <span className="text-sm font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => handlePasswordChange(student)}
                        className="flex-1 flex items-center justify-center gap-2 p-2 text-purple-600 bg-purple-50 rounded-lg"
                      >
                        <FaKey className="w-4 h-4" />
                        <span className="text-sm font-medium">Password</span>
                      </button>
                      <button
                        onClick={() => {
                          setStudentToDelete(student);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 p-2 text-red-600 bg-red-50 rounded-lg"
                      >
                        <FaTrash className="w-4 h-4" />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Mobile Empty State */}
          {filteredStudents.length === 0 && (
            <div className={`text-center py-12 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <FaUserGraduate className={`w-16 h-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-3`} />
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>No students found</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                No students in {adminDepartment} department
              </p>
            </div>
          )}
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
              </div>

              <div className="inline-block lg:mt-[250px] align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full " >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FaKey className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Change Password - {selectedStudent.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Student ID: {selectedStudent.id} | Department: {selectedStudent.department}
                      </p>
                      
                      {passwordSuccess ? (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-500" />
                            <p className="text-sm text-green-700">{passwordSuccess}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-4">
                          {/* Generate Password Button */}
                          <button
                            onClick={generateRandomPassword}
                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                          >
                            <FiRefreshCw className="w-4 h-4" />
                            Generate random password
                          </button>

                          {/* New Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPassword ? (
                                  <FaEyeSlash className="text-gray-400" />
                                ) : (
                                  <FaEye className="text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Confirm Password */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showConfirmPassword ? (
                                  <FaEyeSlash className="text-gray-400" />
                                ) : (
                                  <FaEye className="text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Password Error */}
                          {passwordError && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {passwordError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  {!passwordSuccess && (
                    <button
                      type="button"
                      onClick={handlePasswordSubmit}
                      className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Update Password
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setSelectedStudent(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {passwordSuccess ? "Close" : "Cancel"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 bg-opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Student
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete <span className="font-semibold">{studentToDelete?.name}</span>? 
                          This action cannot be undone.
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Student ID: {studentToDelete?.id} | Department: {studentToDelete?.department}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => handleDelete(studentToDelete.id)}
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingStudent && (
          <Modal
            title="Edit Student"
            onClose={() => setEditingStudent(null)}
            onSave={(updatedData) => handleUpdate({ ...editingStudent, ...updatedData })}
            initialData={editingStudent}
          />
        )}
      </div>
    </div>
  );
};

export default ViewStudents;