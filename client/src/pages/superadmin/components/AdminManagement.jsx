import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  MoreVertical,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  Save,
  AlertCircle
} from "lucide-react";

const AdminManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form state for new admin
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    password: "",
    confirmPassword: "",
    permissions: {
      createExam: false,
      manageStudents: false,
      viewResults: false,
      manageQuestions: false,
      fullAccess: false
    }
  });

  // Initial admins list
  const [adminsList, setAdminsList] = useState([
    { 
      id: 1, 
      name: "John Doe", 
      email: "john.doe@example.com", 
      department: "Science", 
      students: 245, 
      exams: 12, 
      status: "active", 
      lastActive: "2 min ago", 
      phone: "+1 234-567-8901",
      joinDate: "2023-01-15",
      permissions: ["create_exam", "manage_students", "view_results"]
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      email: "jane.smith@example.com", 
      department: "Commerce", 
      students: 189, 
      exams: 8, 
      status: "active", 
      lastActive: "15 min ago", 
      phone: "+1 234-567-8902",
      joinDate: "2023-03-20",
      permissions: ["create_exam", "manage_students"]
    },
    { 
      id: 3, 
      name: "Mike Johnson", 
      email: "mike.j@example.com", 
      department: "Arts", 
      students: 156, 
      exams: 6, 
      status: "inactive", 
      lastActive: "2 days ago", 
      phone: "+1 234-567-8903",
      joinDate: "2023-02-10",
      permissions: ["view_results"]
    },
    { 
      id: 4, 
      name: "Sarah Wilson", 
      email: "sarah.w@example.com", 
      department: "Science", 
      students: 198, 
      exams: 10, 
      status: "active", 
      lastActive: "1 hour ago", 
      phone: "+1 234-567-8904",
      joinDate: "2023-04-05",
      permissions: ["create_exam", "manage_students", "view_results", "manage_questions"]
    },
    { 
      id: 5, 
      name: "Tom Brown", 
      email: "tom.b@example.com", 
      department: "Commerce", 
      students: 167, 
      exams: 7, 
      status: "active", 
      lastActive: "3 hours ago", 
      phone: "+1 234-567-8905",
      joinDate: "2023-05-12",
      permissions: ["create_exam", "manage_students"]
    },
    { 
      id: 6, 
      name: "Emily Davis", 
      email: "emily.d@example.com", 
      department: "Arts", 
      students: 295, 
      exams: 15, 
      status: "active", 
      lastActive: "30 min ago", 
      phone: "+1 234-567-8906",
      joinDate: "2023-01-30",
      permissions: ["create_exam", "manage_students", "view_results", "manage_questions", "manage_admins"]
    },
  ]);

  // Filter admins based on search and filters
  const filteredAdmins = adminsList.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || admin.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || admin.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  // Handle input change for new admin form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle permission change
  const handlePermissionChange = (permission) => {
    setNewAdmin(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  // Handle full access toggle
  const handleFullAccessToggle = () => {
    const newFullAccess = !newAdmin.permissions.fullAccess;
    setNewAdmin(prev => ({
      ...prev,
      permissions: {
        createExam: newFullAccess,
        manageStudents: newFullAccess,
        viewResults: newFullAccess,
        manageQuestions: newFullAccess,
        fullAccess: newFullAccess
      }
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!newAdmin.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    
    if (!newAdmin.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    
    if (!newAdmin.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!newAdmin.phone.trim()) {
      errors.phone = "Phone number is required";
    }
    
    if (!newAdmin.department) {
      errors.department = "Department is required";
    }
    
    if (!newAdmin.password) {
      errors.password = "Password is required";
    } else if (newAdmin.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    return errors;
  };

  // Handle add admin
  const handleAddAdmin = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // Create new admin object
      const newAdminObj = {
        id: adminsList.length + 1,
        name: `${newAdmin.firstName} ${newAdmin.lastName}`,
        email: newAdmin.email,
        department: newAdmin.department,
        students: 0,
        exams: 0,
        status: "active",
        lastActive: "Just now",
        phone: newAdmin.phone,
        joinDate: new Date().toISOString().split('T')[0],
        permissions: Object.keys(newAdmin.permissions)
          .filter(key => newAdmin.permissions[key] && key !== 'fullAccess')
          .map(key => {
            switch(key) {
              case 'createExam': return 'create_exam';
              case 'manageStudents': return 'manage_students';
              case 'viewResults': return 'view_results';
              case 'manageQuestions': return 'manage_questions';
              default: return key;
            }
          })
      };

      // Add to admins list
      setAdminsList(prev => [...prev, newAdminObj]);
      
      // Show success message
      setSuccessMessage("Admin added successfully!");
      
      // Reset form and close modal after 2 seconds
      setTimeout(() => {
        setIsSubmitting(false);
        setShowAddModal(false);
        setSuccessMessage("");
        // Reset form
        setNewAdmin({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          department: "",
          password: "",
          confirmPassword: "",
          permissions: {
            createExam: false,
            manageStudents: false,
            viewResults: false,
            manageQuestions: false,
            fullAccess: false
          }
        });
        setFormErrors({});
      }, 2000);
    }, 1500);
  };

  // Handle view admin
  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  // Handle edit admin
  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    // Populate edit form with admin data
    setShowEditModal(true);
  };

  // Handle delete admin
  const handleDeleteAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  // Confirm delete admin
  const confirmDeleteAdmin = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setAdminsList(prev => prev.filter(admin => admin.id !== selectedAdmin.id));
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      setSuccessMessage("Admin deleted successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1000);
  };

  // Handle status toggle
  const handleStatusToggle = (admin) => {
    setAdminsList(prev => 
      prev.map(a => 
        a.id === admin.id 
          ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' }
          : a
      )
    );
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Add Admin Modal
  const AddAdminModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Add New Admin</h2>
            <button 
              onClick={() => setShowAddModal(false)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="firstName"
                value={newAdmin.firstName}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${
                  formErrors.firstName ? 'border-red-500' : ''
                }`}
                placeholder="Enter first name"
                disabled={isSubmitting}
              />
              {formErrors.firstName && (
                <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="lastName"
                value={newAdmin.lastName}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${
                  formErrors.lastName ? 'border-red-500' : ''
                }`}
                placeholder="Enter last name"
                disabled={isSubmitting}
              />
              {formErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input 
              type="email" 
              name="email"
              value={newAdmin.email}
              onChange={handleInputChange}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${
                formErrors.email ? 'border-red-500' : ''
              }`}
              placeholder="Enter email address"
              disabled={isSubmitting}
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input 
              type="tel" 
              name="phone"
              value={newAdmin.phone}
              onChange={handleInputChange}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${
                formErrors.phone ? 'border-red-500' : ''
              }`}
              placeholder="Enter phone number"
              disabled={isSubmitting}
            />
            {formErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select 
              name="department"
              value={newAdmin.department}
              onChange={handleInputChange}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${
                formErrors.department ? 'border-red-500' : ''
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select Department</option>
              <option value="Science">Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts">Arts</option>
              <option value="Engineering">Engineering</option>
            </select>
            {formErrors.department && (
              <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input 
                type="password" 
                name="password"
                value={newAdmin.password}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${
                  formErrors.password ? 'border-red-500' : ''
                }`}
                placeholder="Enter password"
                disabled={isSubmitting}
              />
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input 
                type="password" 
                name="confirmPassword"
                value={newAdmin.confirmPassword}
                onChange={handleInputChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none ${
                  formErrors.confirmPassword ? 'border-red-500' : ''
                }`}
                placeholder="Confirm password"
                disabled={isSubmitting}
              />
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newAdmin.permissions.createExam}
                  onChange={() => handlePermissionChange('createExam')}
                  className="rounded"
                  disabled={isSubmitting}
                />
                <span className="text-sm">Create Exams</span>
              </label>
              <label className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newAdmin.permissions.manageStudents}
                  onChange={() => handlePermissionChange('manageStudents')}
                  className="rounded"
                  disabled={isSubmitting}
                />
                <span className="text-sm">Manage Students</span>
              </label>
              <label className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newAdmin.permissions.viewResults}
                  onChange={() => handlePermissionChange('viewResults')}
                  className="rounded"
                  disabled={isSubmitting}
                />
                <span className="text-sm">View Results</span>
              </label>
              <label className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newAdmin.permissions.manageQuestions}
                  onChange={() => handlePermissionChange('manageQuestions')}
                  className="rounded"
                  disabled={isSubmitting}
                />
                <span className="text-sm">Manage Questions</span>
              </label>
              <label className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer col-span-2">
                <input 
                  type="checkbox" 
                  checked={newAdmin.permissions.fullAccess}
                  onChange={handleFullAccessToggle}
                  className="rounded"
                  disabled={isSubmitting}
                />
                <span className="text-sm font-medium">Full Access (All permissions)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button 
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // View Admin Modal
  const ViewAdminModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Admin Details</h2>
            <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {selectedAdmin && (
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <img 
                src={`https://ui-avatars.com/api/?name=${selectedAdmin.name}&size=80&background=0D8F81&color=fff`}
                alt={selectedAdmin.name}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold">{selectedAdmin.name}</h3>
                <p className="text-gray-500">{selectedAdmin.email}</p>
                <p className="text-sm text-gray-500 mt-1">{selectedAdmin.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{selectedAdmin.department}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Join Date</p>
                <p className="font-medium">{selectedAdmin.joinDate}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Students Managed</p>
                <p className="font-medium">{selectedAdmin.students}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Exams Created</p>
                <p className="font-medium">{selectedAdmin.exams}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {selectedAdmin.permissions.map((perm, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {perm.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  handleEditAdmin(selectedAdmin);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Admin
              </button>
              <button 
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mb-2">Delete Admin</h2>
          <p className="text-gray-500 text-center mb-6">
            Are you sure you want to delete {selectedAdmin?.name}? This action cannot be undone.
          </p>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              onClick={confirmDeleteAdmin}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2 shadow-lg z-50">
          <CheckCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Management</h1>
          <p className="text-gray-500 mt-1">Manage department administrators and their permissions</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500">Total Admins</p>
          <p className="text-2xl font-bold">{adminsList.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500">Active Admins</p>
          <p className="text-2xl font-bold text-green-600">{adminsList.filter(a => a.status === 'active').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500">Departments</p>
          <p className="text-2xl font-bold text-blue-600">4</p>
        </div>
        <div className="bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500">Total Students Managed</p>
          <p className="text-2xl font-bold text-purple-600">1,250</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex-1 min-w-[200px] flex items-center border rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search admins by name or email..." 
            className="ml-2 flex-1 outline-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select 
          className="border rounded-lg px-3 py-2 min-w-[150px]"
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Departments</option>
          <option value="Science">Science</option>
          <option value="Commerce">Commerce</option>
          <option value="Arts">Arts</option>
          <option value="Engineering">Engineering</option>
        </select>
        <select 
          className="border rounded-lg px-3 py-2 min-w-[150px]"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button 
          className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
          onClick={resetFilters}
          title="Reset Filters"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <button className="p-2 border rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Admin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Students</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Exams</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Join Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Last Active</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentItems.length > 0 ? (
                currentItems.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${admin.name}&background=random&size=40`}
                          alt={admin.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {admin.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{admin.students}</td>
                    <td className="px-6 py-4 font-medium">{admin.exams}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{admin.joinDate}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(admin)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 w-fit transition-colors ${
                          admin.status === 'active' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {admin.status === 'active' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span className="capitalize">{admin.status}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{admin.lastActive}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewAdmin(admin)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditAdmin(admin)}
                          className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAdmin(admin)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No admins found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAdmins.length > 0 && (
          <div className="px-6 py-4 border-t flex flex-wrap gap-4 justify-between items-center bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAdmins.length)} of {filteredAdmins.length} entries
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-blue-600 text-white' 
                      : 'border hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && <AddAdminModal />}
      {showViewModal && <ViewAdminModal />}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default AdminManagement;