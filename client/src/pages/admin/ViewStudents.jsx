import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaKey,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserGraduate,
  FaEnvelope,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

// Reusable Modal Component
const Modal = ({ title, onClose, onSave, initialData, children }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6">
          {children || (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewStudents = () => {
  const navigate = useNavigate();
  const [adminDepartment, setAdminDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Dummy data – realistic students in different departments
  const [students, setStudents] = useState([
    { id: "CS101", name: "Rahul Sharma", department: "Computer Science", email: "rahul.cs@college.edu", status: "active" },
    { id: "CS102", name: "Priya Patil", department: "Computer Science", email: "priya.cs@college.edu", status: "active" },
    { id: "CS103", name: "Amit Verma", department: "Computer Science", email: "amit.cs@college.edu", status: "inactive" },
    { id: "ME201", name: "Rohan Patil", department: "Mechanical", email: "rohan.me@college.edu", status: "active" },
    { id: "ME202", name: "Neha Borkar", department: "Mechanical", email: "neha.me@college.edu", status: "active" },
    { id: "CV301", name: "Yash Thakare", department: "Civil", email: "yash.cv@college.edu", status: "active" },
    { id: "CV302", name: "Kavita Raut", department: "Civil", email: "kavita.cv@college.edu", status: "inactive" },
    { id: "EC401", name: "Aditya Kulkarni", department: "Electronics", email: "aditya.ec@college.edu", status: "active" },
    { id: "EC402", name: "Sneha Joshi", department: "Electronics", email: "sneha.ec@college.edu", status: "active" },
    { id: "IT501", name: "Vikas Deshmukh", department: "IT", email: "vikas.it@college.edu", status: "active" },
  ]);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const dept = localStorage.getItem("adminDepartment");

    if (role !== "admin" || !dept) {
      navigate("/");
      return;
    }

    setAdminDepartment(dept);
  }, [navigate]);

  const filteredStudents = students.filter((student) => {
    // Only show students from admin's department
    if (student.department !== adminDepartment) return false;

    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || statusFilter === "All" || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  const handleUpdate = (updated) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
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
    if (!newPassword || !confirmPassword) {
      setPasswordError("Both fields are required");
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
      setSelectedStudent(null);
    }, 2000);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setConfirmPassword(pwd);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  const activeFilters = [searchTerm, statusFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">View Students</h1>
          <p className="text-gray-600 mt-2">
            Manage students in <strong>{adminDepartment}</strong> department
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{filteredStudents.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <p className="text-sm text-gray-600">Active Students</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {filteredStudents.filter((s) => s.status === "active").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <p className="text-sm text-gray-600">Inactive Students</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {filteredStudents.filter((s) => s.status === "inactive").length}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition flex items-center gap-2"
            >
              <FaTimes /> Clear
            </button>
          )}
        </div>

        {/* Students Table */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow text-center border border-gray-200">
            <FaUserGraduate className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No students found</h3>
            <p className="text-gray-600">
              No students in <strong>{adminDepartment}</strong> match your search/filter.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">{student.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handlePasswordChange(student)}
                          className="text-purple-600 hover:text-purple-900 mr-3"
                          title="Change Password"
                        >
                          <FaKey />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToDelete(student);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold">
                  Change Password - {selectedStudent.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  ID: {selectedStudent.id} | Department: {selectedStudent.department}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {passwordSuccess ? (
                  <div className="p-4 bg-green-50 text-green-800 rounded-lg flex items-center gap-3">
                    <FaCheckCircle size={24} />
                    {passwordSuccess}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={generateRandomPassword}
                      className="w-full py-2 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition flex items-center justify-center gap-2"
                    >
                      <FiRefreshCw /> Generate Random Password
                    </button>

                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Confirm new password"
                      />
                    </div>

                    {passwordError && (
                      <p className="text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
                        <FaExclamationTriangle /> {passwordError}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                {!passwordSuccess && (
                  <button
                    onClick={handlePasswordSubmit}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Update Password
                  </button>
                )}
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && studentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-red-600">Confirm Delete</h3>
                <p className="mt-2 text-gray-600">
                  Are you sure you want to delete <strong>{studentToDelete.name}</strong>?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ID: {studentToDelete.id} | Department: {studentToDelete.department}
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingStudent && (
          <Modal
            title="Edit Student"
            onClose={() => setEditingStudent(null)}
            onSave={(updated) => handleUpdate({ ...editingStudent, ...updated })}
            initialData={editingStudent}
          />
        )}
      </div>
    </div>
  );
};

export default ViewStudents;