import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  ChevronDown,
  Award,
  TrendingUp,
  TrendingDown,
  X,
  UserCheck,
  UserX,
  BarChart2
} from "lucide-react";
import { mockData } from "../../../data/mockData";

const StudentData = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const filteredStudents = mockData.studentData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || student.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const StudentDetailModal = ({ student, onClose }) => {
    const studentDetails = mockData.studentExamDetails.find(d => d.studentId === student.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b sticky top-0 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Student Details</h2>
                <p className="text-gray-500 mt-1">Complete information and exam history</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Student Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${student.name}&background=0D8F81&color=fff&size=80`}
                    alt={student.name}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{student.name}</h3>
                    <p className="text-gray-600">{student.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="flex items-center space-x-1 text-sm text-gray-500">
                        <GraduationCap className="w-4 h-4" />
                        <span>{student.enrollmentNo}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{student.semester} Semester</span>
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {student.status}
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-500">Total Exams</p>
                <p className="text-2xl font-bold">{student.totalExams}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-blue-600">{student.averageScore}%</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-500">Passed Exams</p>
                <p className="text-2xl font-bold text-green-600">
                  {student.exams.filter(e => e.status === 'passed').length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-500">Failed Exams</p>
                <p className="text-2xl font-bold text-red-600">
                  {student.exams.filter(e => e.status === 'failed').length}
                </p>
              </div>
            </div>

            {/* Exam History */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Exam History</h3>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Exam Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Percentage</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Time Taken</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {studentDetails?.examHistory.map((exam, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{exam.examName}</td>
                      <td className="px-4 py-3 text-gray-600">{exam.date}</td>
                      <td className="px-4 py-3">{exam.score}/{exam.totalMarks}</td>
                      <td className="px-4 py-3 font-medium">{exam.percentage}%</td>
                      <td className="px-4 py-3">{exam.rank}</td>
                      <td className="px-4 py-3 text-gray-600">{exam.timeTaken}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          exam.status === 'passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {exam.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
              <div className="h-48 flex items-end justify-around">
                {studentDetails?.examHistory.map((exam, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-12 bg-blue-500 rounded-t-lg"
                      style={{ height: `${exam.percentage}px` }}
                    ></div>
                    <p className="text-xs mt-2">{exam.examName.split(' ')[0]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Data</h1>
          <p className="text-gray-500 mt-1">View and manage all students across departments</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <BarChart2 className="w-4 h-4" />
            <span>Analytics</span>
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center border rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="ml-2 flex-1 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="border rounded-lg px-3 py-2"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="all">All Departments</option>
          <option value="Science">Science</option>
          <option value="Commerce">Commerce</option>
          <option value="Arts">Arts</option>
          <option value="Engineering">Engineering</option>
        </select>

        <select 
          className="border rounded-lg px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select 
          className="border rounded-lg px-3 py-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="avgScore">Sort by Average Score</option>
          <option value="enrollment">Sort by Enrollment</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Student</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Department</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Enrollment No</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Semester</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Exams Taken</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Avg Score</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${student.name}&background=random&size=40`}
                      alt={student.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {student.department}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-sm">{student.enrollmentNo}</td>
                <td className="px-6 py-4">{student.semester}</td>
                <td className="px-6 py-4">{student.totalExams}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-1">
                    <span className={`font-medium ${
                      student.averageScore >= 75 ? 'text-green-600' :
                      student.averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {student.averageScore}%
                    </span>
                    {student.averageScore >= 75 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : student.averageScore >= 50 ? (
                      <TrendingUp className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {student.status === 'active' ? (
                      <UserCheck className="w-3 h-3" />
                    ) : (
                      <UserX className="w-3 h-3" />
                    )}
                    <span>{student.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedStudent(student)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors" title="Send Email">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors" title="Call">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing 1 to {filteredStudents.length} of {mockData.studentData.length} entries
          </p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded hover:bg-gray-100">Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-100">2</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-100">3</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-100">Next</button>
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
};

export default StudentData;