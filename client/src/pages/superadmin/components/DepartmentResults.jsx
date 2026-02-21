import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Award, 
  BarChart3,
  Download,
  Filter,
  Search,
  Eye,
  Calendar,
  ChevronDown,
  PieChart,
  Building2,  // Added missing import
  X            // Added missing import
} from "lucide-react";
import { mockData } from "../../../data/mockData";

const DepartmentResults = () => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("performance");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Calculate department stats
  const departmentStats = {
    totalStudents: mockData.departmentResults.reduce((acc, dept) => acc + dept.totalStudents, 0),
    totalAppeared: mockData.departmentResults.reduce((acc, dept) => acc + dept.appearedStudents, 0),
    totalPassed: mockData.departmentResults.reduce((acc, dept) => acc + dept.passedStudents, 0),
    totalFailed: mockData.departmentResults.reduce((acc, dept) => acc + dept.failedStudents, 0),
    overallAvg: (mockData.departmentResults.reduce((acc, dept) => acc + dept.averageScore, 0) / mockData.departmentResults.length).toFixed(1),
    overallPassRate: ((mockData.departmentResults.reduce((acc, dept) => acc + dept.passedStudents, 0) / 
                      mockData.departmentResults.reduce((acc, dept) => acc + dept.appearedStudents, 0)) * 100).toFixed(1)
  };

  // Filter and sort departments
  const filteredDepartments = mockData.departmentResults
    .filter(dept => dept.department.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch(sortBy) {
        case "highestAvg":
          return b.averageScore - a.averageScore;
        case "lowestAvg":
          return a.averageScore - b.averageScore;
        case "mostStudents":
          return b.totalStudents - a.totalStudents;
        default:
          return a.department.localeCompare(b.department);
      }
    });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  const DepartmentCard = ({ dept }) => {
    const passRate = ((dept.passedStudents / dept.appearedStudents) * 100).toFixed(1);
    const passRateColor = passRate >= 75 ? 'text-green-600' : passRate >= 50 ? 'text-yellow-600' : 'text-red-600';
    
    return (
      <div 
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => setSelectedDepartment(dept)}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {dept.department}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Department Results</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Total Students</p>
            <p className="text-xl font-bold text-gray-800">{dept.totalStudents.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Appeared</p>
            <p className="text-xl font-bold text-gray-800">{dept.appearedStudents.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Pass Rate</span>
            <span className={`text-sm font-medium ${passRateColor}`}>
              {passRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                passRate >= 75 ? 'bg-green-500' : passRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${passRate}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t">
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{dept.averageScore}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">{dept.highestScore}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">{dept.lowestScore}%</span>
            </div>
          </div>
        </div>

        <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>
      </div>
    );
  };

  const DepartmentDetailModal = ({ dept, onClose }) => {
    const topStudents = mockData.studentData
      .filter(s => s.department === dept.department)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{dept.department} Department</h2>
                <p className="text-gray-500 mt-1">Complete performance analysis and exam statistics</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-700">{dept.totalStudents}</p>
                <p className="text-xs text-blue-500 mt-1">Enrolled</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600">Passed</p>
                <p className="text-2xl font-bold text-green-700">{dept.passedStudents}</p>
                <p className="text-xs text-green-500 mt-1">
                  {((dept.passedStudents / dept.appearedStudents) * 100).toFixed(1)}% pass rate
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-700">{dept.failedStudents}</p>
                <p className="text-xs text-red-500 mt-1">
                  {((dept.failedStudents / dept.appearedStudents) * 100).toFixed(1)}% fail rate
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600">Average Score</p>
                <p className="text-2xl font-bold text-purple-700">{dept.averageScore}%</p>
                <p className="text-xs text-purple-500 mt-1">Overall performance</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-500">Highest Score</p>
                <p className="text-xl font-bold text-green-600">{dept.highestScore}%</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-500">Lowest Score</p>
                <p className="text-xl font-bold text-red-600">{dept.lowestScore}%</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-500">Total Exams</p>
                <p className="text-xl font-bold text-blue-600">{dept.exams.length}</p>
              </div>
            </div>

            {/* Exam-wise Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Exam-wise Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Exam Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Appeared</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Passed</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Pass %</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {dept.exams.map((exam, index) => {
                      const passPercentage = ((exam.passed / exam.appeared) * 100).toFixed(1);
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{exam.name}</td>
                          <td className="px-4 py-3 text-gray-600">{exam.conducted}</td>
                          <td className="px-4 py-3">{exam.appeared}</td>
                          <td className="px-4 py-3 text-green-600">{exam.passed}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              passPercentage >= 75 ? 'bg-green-100 text-green-700' :
                              passPercentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {passPercentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">{exam.avgScore}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Performing Students */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Top Performing Students</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Enrollment No</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Semester</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Avg Score</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <img 
                              src={`https://ui-avatars.com/api/?name=${student.name}&background=random&size=30`}
                              alt={student.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{student.enrollmentNo}</td>
                        <td className="px-4 py-3">{student.semester}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-blue-600">{student.averageScore}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Department Results</h1>
          <p className="text-gray-500 mt-1">View and analyze department-wise examination results</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            className="border rounded-lg px-3 py-2 bg-white"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            <span>Custom Range</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:shadow-lg transition-shadow">
          <p className="text-sm opacity-90">Total Students</p>
          <p className="text-2xl font-bold">{departmentStats.totalStudents.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">Across all departments</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl hover:shadow-lg transition-shadow">
          <p className="text-sm opacity-90">Appeared</p>
          <p className="text-2xl font-bold">{departmentStats.totalAppeared.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">{((departmentStats.totalAppeared / departmentStats.totalStudents) * 100).toFixed(1)}% attendance</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-xl hover:shadow-lg transition-shadow">
          <p className="text-sm opacity-90">Passed</p>
          <p className="text-2xl font-bold">{departmentStats.totalPassed.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">{departmentStats.overallPassRate}% pass rate</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl hover:shadow-lg transition-shadow">
          <p className="text-sm opacity-90">Failed</p>
          <p className="text-2xl font-bold">{departmentStats.totalFailed.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">{(100 - parseFloat(departmentStats.overallPassRate)).toFixed(1)}% fail rate</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:shadow-lg transition-shadow">
          <p className="text-sm opacity-90">Avg Score</p>
          <p className="text-2xl font-bold">{departmentStats.overallAvg}%</p>
          <p className="text-xs opacity-75 mt-1">Overall average</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex-1 min-w-[200px] flex items-center border rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search departments..." 
            className="ml-2 flex-1 outline-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select 
          className="border rounded-lg px-3 py-2 min-w-[180px]"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="performance">Sort by Department</option>
          <option value="highestAvg">Highest Average</option>
          <option value="lowestAvg">Lowest Average</option>
          <option value="mostStudents">Most Students</option>
        </select>
        <button className="p-2 border rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Department Cards Grid */}
      {currentItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((dept) => (
              <DepartmentCard key={dept.id} dept={dept} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
              <p className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDepartments.length)} of {filteredDepartments.length} departments
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
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Departments Found</h3>
          <p className="text-gray-500">No departments match your search criteria.</p>
        </div>
      )}

      {/* Department Detail Modal */}
      {selectedDepartment && (
        <DepartmentDetailModal 
          dept={selectedDepartment} 
          onClose={() => setSelectedDepartment(null)} 
        />
      )}
    </div>
  );
};

export default DepartmentResults;