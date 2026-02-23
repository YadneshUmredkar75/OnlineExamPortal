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
  FiAlertCircle,
  FiUpload,
} from "react-icons/fi";
import * as XLSX from "xlsx";

const AddStudent = () => {
  const navigate = useNavigate();
  const [adminDepartment, setAdminDepartment] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    password: "",
    email: "",
    department: "", // Admin chooses this for single student
  });

  // All possible departments (you can expand this list)
  const availableDepartments = [
    "Computer Science",
    "IT",
    "Mechanical",
    "Civil",
    "Electronics",
    "Electrical",
    "Chemical",
    "Biotechnology",
  ];

  const [students, setStudents] = useState([
    { id: "101", name: "John Doe", department: "IT", email: "john.doe@example.com", status: "active", joinDate: "2024-01-15" },
    { id: "102", name: "Jane Smith", department: "Computer Science", email: "jane.smith@example.com", status: "active", joinDate: "2024-02-20" },
    { id: "103", name: "Bob Wilson", department: "IT", email: "bob.wilson@example.com", status: "active", joinDate: "2024-03-10" },
    { id: "104", name: "Alice Johnson", department: "IT", email: "alice.j@example.com", status: "inactive", joinDate: "2024-01-05" },
  ]);

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk states
  const [excelFile, setExcelFile] = useState(null);
  const [excelPreview, setExcelPreview] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkSuccess, setBulkSuccess] = useState("");

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const dept = localStorage.getItem("adminDepartment");

    if (userRole !== "admin" || !dept) {
      navigate("/");
    }
    setAdminDepartment(dept);
  }, [navigate]);

  // ── Single student validation ───────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    else if (formData.name.trim().length < 3) newErrors.name = "Name must be at least 3 characters";

    if (!formData.studentId.trim()) newErrors.studentId = "Student ID is required";
    else if (!/^[A-Z0-9]{4,10}$/i.test(formData.studentId.trim()))
      newErrors.studentId = "ID must be 4-10 alphanumeric characters";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address";

    if (!formData.department) newErrors.department = "Please select a department";
    else if (!availableDepartments.includes(formData.department))
      newErrors.department = "Invalid department selected";

    // Duplicate check in selected department
    const duplicate = students.some(
      (s) =>
        s.id.trim().toUpperCase() === formData.studentId.trim().toUpperCase() &&
        s.department === formData.department
    );
    if (duplicate) newErrors.studentId = `Student ID already exists in ${formData.department}`;

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      await new Promise((r) => setTimeout(r, 1000));

      const newStudent = {
        id: formData.studentId.trim(),
        name: formData.name.trim(),
        department: formData.department, // ← chosen department
        email: formData.email.trim(),
        status: "active",
        joinDate: new Date().toISOString().split("T")[0],
      };

      setStudents((prev) => [newStudent, ...prev]);
      setSuccessMessage(`Student added successfully to ${formData.department} department!`);

      setFormData({
        name: "",
        studentId: "",
        password: "",
        email: "",
        department: "",
      });

      setTimeout(() => setSuccessMessage(""), 4000);
    } else {
      setErrors(newErrors);
    }

    setIsSubmitting(false);
  };

  // ── Bulk Excel handler ───────────────────────────────────────────────
  const handleExcelFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);
    setBulkErrors([]);
    setBulkSuccess("");
    setExcelPreview([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });

      if (jsonData.length < 2) {
        setBulkErrors(["Excel file is empty or invalid."]);
        return;
      }

      const headers = jsonData[0]
        .map((h) => String(h || "").trim().toLowerCase().replace(/\s+/g, ""));

      const nameIdx = headers.findIndex((h) =>
        ["name", "fullname", "studentname", "full name"].includes(h)
      );
      const idIdx = headers.findIndex((h) =>
        ["studentid", "id", "rollno", "rollnumber", "student id"].includes(h)
      );
      const emailIdx = headers.findIndex((h) => h.includes("email"));
      const passIdx = headers.findIndex((h) => h.includes("pass"));
      const deptIdx = headers.findIndex((h) =>
        ["department", "dept", "branch"].includes(h)
      );

      if (nameIdx === -1 || idIdx === -1 || emailIdx === -1) {
        setBulkErrors([
          "Missing required columns. Expected at least:",
          "• Name / Full Name / Student Name",
          "• StudentID / ID / RollNo",
          "• Email",
        ]);
        return;
      }

      const rows = jsonData.slice(1);

      const parsed = rows
        .map((row, idx) => {
          const name  = String(row[nameIdx]  || "").trim();
          const sid   = String(row[idIdx]    || "").trim();
          const email = String(row[emailIdx] || "").trim();
          const pass  = passIdx !== -1 ? String(row[passIdx] || "").trim() : "";
          const dept  = deptIdx !== -1 ? String(row[deptIdx] || "").trim() : "";

          if (!name || !sid || !email) return null;

          return {
            rowIndex: idx + 2,
            name,
            studentId: sid,
            email,
            password: pass || "Student@123",
            department: dept || adminDepartment, // fallback to admin dept
          };
        })
        .filter(Boolean);

      const tempErrors = [];
      const existingByDept = {};

      // Group existing IDs by department for accurate duplicate check
      students.forEach((s) => {
        if (!existingByDept[s.department]) existingByDept[s.department] = new Set();
        existingByDept[s.department].add(s.id.trim().toUpperCase());
      });

      parsed.forEach((r) => {
        const idValue = r.studentId.trim().toUpperCase();
        const targetDept = r.department;

        if (!availableDepartments.includes(targetDept)) {
          tempErrors.push(`Row ${r.rowIndex}: Invalid department "${r.department}"`);
        }

        if (existingByDept[targetDept]?.has(idValue)) {
          tempErrors.push(`Row ${r.rowIndex}: ID ${r.studentId} already exists in ${targetDept}`);
        }
      });

      setExcelPreview(parsed);
      setBulkErrors(tempErrors);
    } catch (err) {
      console.error("Excel error:", err);
      setBulkErrors([
        "Could not read Excel file.",
        "Make sure it's a valid .xlsx file (not renamed .csv).",
      ]);
    }
  };

  const confirmBulkAdd = () => {
    if (excelPreview.length === 0 || bulkErrors.length > 0) return;

    const now = new Date().toISOString().split("T")[0];
    const newEntries = excelPreview.map((item) => ({
      id: item.studentId.trim(),
      name: item.name.trim(),
      department: item.department, // respects Excel column if present
      email: item.email.trim(),
      status: "active",
      joinDate: now,
    }));

    setStudents((prev) => [...newEntries, ...prev]);
    setBulkSuccess(`Added ${newEntries.length} student(s) successfully!`);
    setExcelFile(null);
    setExcelPreview([]);
    setBulkErrors([]);

    setTimeout(() => setBulkSuccess(""), 5000);
  };

  // ── Department styling helper ──────────────────────────────────────
  const getDepartmentDetails = (dept = adminDepartment) => {
    const departments = {
      "Computer Science": {
        icon: "💻",
        lightBg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        bg: "bg-blue-600",
        hoverBg: "hover:bg-blue-700",
        ring: "ring-blue-500",
      },
      IT: {
        icon: "🌐",
        lightBg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        bg: "bg-purple-600",
        hoverBg: "hover:bg-purple-700",
        ring: "ring-purple-500",
      },
      Mechanical: {
        icon: "⚙️",
        lightBg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        bg: "bg-orange-600",
        hoverBg: "hover:bg-orange-700",
        ring: "ring-orange-500",
      },
      Civil: {
        icon: "🏗️",
        lightBg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        bg: "bg-green-600",
        hoverBg: "hover:bg-green-700",
        ring: "ring-green-500",
      },
      Electronics: {
        icon: "⚡",
        lightBg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        bg: "bg-yellow-600",
        hoverBg: "hover:bg-yellow-700",
        ring: "ring-yellow-500",
      },
    };

    return (
      departments[dept] || {
        icon: "📚",
        lightBg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        bg: "bg-gray-600",
        hoverBg: "hover:bg-gray-700",
        ring: "ring-gray-500",
      }
    );
  };

  const deptDetails = getDepartmentDetails();
  const departmentStudents = students.filter((s) => s.department === adminDepartment);
  const activeStudents = departmentStudents.filter((s) => s.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header + Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <FiUsers className="w-4 h-4" />
                Manage students across departments
              </p>
            </div>

            <div className={`px-6 py-3 ${deptDetails.lightBg} rounded-lg border ${deptDetails.border}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{deptDetails.icon}</span>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">YOUR DEPARTMENT</p>
                  <p className={`text-lg font-semibold ${deptDetails.text}`}>{adminDepartment}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
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

            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
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

            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {departmentStudents.filter((s) => s.joinDate?.startsWith("2026-02")).length}
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
                Single add: Choose any department
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Bulk Excel add: Automatically uses your department ({adminDepartment})
              </p>
            </div>
          </div>
        </div>

        {/* Success message */}
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

        {/* Bulk Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className={`px-6 py-4 border-b border-gray-200 ${deptDetails.lightBg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${deptDetails.bg} flex items-center justify-center`}>
                <FiUpload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bulk Add Students (Excel)</h2>
                <p className="text-sm text-gray-600">
                  Upload .xlsx file with columns: Name, StudentID, Email, Password (optional), Department (optional)
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File (.xlsx, .xls)
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {excelFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <strong>{excelFile.name}</strong>
                </p>
              )}
            </div>

            {bulkErrors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium mb-2">Issues detected:</p>
                <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
                  {bulkErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {excelPreview.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">
                  Preview — {excelPreview.length} student{excelPreview.length !== 1 ? "s" : ""}
                </h3>

                <div className="overflow-x-auto border border-gray-200 rounded max-h-72">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {excelPreview.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{row.name}</td>
                          <td className="px-4 py-3 text-sm font-medium">{row.studentId}</td>
                          <td className="px-4 py-3 text-sm">{row.email}</td>
                          <td className="px-4 py-3 text-sm">{row.department || adminDepartment}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{row.password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <button
                    onClick={confirmBulkAdd}
                    disabled={bulkErrors.length > 0 || isSubmitting}
                    className={`inline-flex items-center px-6 py-3 rounded-lg text-white font-medium ${deptDetails.bg} ${deptDetails.hoverBg} disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${deptDetails.ring}`}
                  >
                    <FiCheckCircle className="w-5 h-5 mr-2" />
                    Confirm & Add {excelPreview.length} Student{excelPreview.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            )}

            {bulkSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5" />
                  {bulkSuccess}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Single Student Form – with department dropdown */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className={`px-6 py-4 border-b border-gray-200 ${deptDetails.lightBg}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${deptDetails.bg} flex items-center justify-center`}>
                <FiPlusCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">New Student Registration</h2>
                <p className="text-sm text-gray-600">Choose department for this student</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className={`w-5 h-5 ${errors.name ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.name ? "border-red-300 bg-red-50" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-sm text-red-600 flex items-center gap-1 mt-1"><FiAlertCircle className="w-4 h-4" /> {errors.name}</p>}
              </div>

              {/* Student ID */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiHash className={`w-5 h-5 ${errors.studentId ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.studentId ? "border-red-300 bg-red-50" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    placeholder="STU001"
                  />
                </div>
                {errors.studentId && <p className="text-sm text-red-600 flex items-center gap-1 mt-1"><FiAlertCircle className="w-4 h-4" /> {errors.studentId}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className={`w-5 h-5 ${errors.email ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? "border-red-300 bg-red-50" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    placeholder="student@example.com"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600 flex items-center gap-1 mt-1"><FiAlertCircle className="w-4 h-4" /> {errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className={`w-5 h-5 ${errors.password ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${errors.password ? "border-red-300 bg-red-50" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" /> : <FiEye className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600 flex items-center gap-1 mt-1"><FiAlertCircle className="w-4 h-4" /> {errors.password}</p>}
              </div>

              {/* Department Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUsers className={`w-5 h-5 ${errors.department ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.department ? "border-red-300 bg-red-50" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none`}
                  >
                    <option value="">Select Department</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.department && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <FiAlertCircle className="w-4 h-4" /> {errors.department}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding Student...
                  </>
                ) : (
                  <>
                    <FiPlusCircle className="w-5 h-5" />
                    Add Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Students List – showing admin's department students */}
        {departmentStudents.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{adminDepartment} Students</h3>
                    <p className="text-sm text-gray-600">Students in your department</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departmentStudents.slice(0, 10).map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-lg ${getDepartmentDetails(student.department).lightBg} flex items-center justify-center mr-3`}>
                            <span className={`text-sm font-medium ${getDepartmentDetails(student.department).text}`}>
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.joinDate || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${student.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {student.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {departmentStudents.length > 10 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  View all {departmentStudents.length} students →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default AddStudent;