import React, { useState, useEffect } from "react";
import { FiAlertCircle, FiUsers, FiTrendingUp, FiAward } from "react-icons/fi";

const StudentScores = () => {
  const [adminDepartment, setAdminDepartment] = useState("");
  const [scores, setScores] = useState([]);

  // Realistic dummy data – multiple students per department, varied subjects
  const allScores = [
    // Computer Science
    { id: "CS001", studentName: "Rahul Sharma", subject: "Mathematics", score: 85, department: "Computer Science" },
    { id: "CS002", studentName: "Priya Patil", subject: "Data Structures", score: 92, department: "Computer Science" },
    { id: "CS003", studentName: "Amit Verma", subject: "Operating Systems", score: 78, department: "Computer Science" },
    { id: "CS004", studentName: "Sneha Joshi", subject: "DBMS", score: 88, department: "Computer Science" },
    { id: "CS005", studentName: "Vikas Deshmukh", subject: "Computer Networks", score: 65, department: "Computer Science" },
    
    // Mechanical
    { id: "ME001", studentName: "Rohan Patil", subject: "Thermodynamics", score: 72, department: "Mechanical" },
    { id: "ME002", studentName: "Neha Borkar", subject: "Strength of Materials", score: 81, department: "Mechanical" },
    { id: "ME003", studentName: "Sachin Kale", subject: "Fluid Mechanics", score: 68, department: "Mechanical" },
    
    // Civil
    { id: "CV001", studentName: "Yash Thakare", subject: "Structural Analysis", score: 68, department: "Civil" },
    { id: "CV002", studentName: "Kavita Raut", subject: "Surveying", score: 90, department: "Civil" },
    
    // Electronics
    { id: "EC001", studentName: "Aditya Kulkarni", subject: "Digital Electronics", score: 76, department: "Electronics" },
    { id: "EC002", studentName: "Pooja More", subject: "Microprocessors", score: 82, department: "Electronics" },
  ];

  useEffect(() => {
    const dept = localStorage.getItem("adminDepartment");
    if (dept) {
      setAdminDepartment(dept);
      // Filter scores to show only this admin's department
      const filtered = allScores.filter((s) => s.department === dept);
      setScores(filtered);
    } else {
      setAdminDepartment("Not set");
      setScores([]);
    }
  }, []);

  // Calculate stats from filtered scores
  const scoresList = scores.map((s) => s.score);
  const highest = scoresList.length > 0 ? Math.max(...scoresList) : 0;
  const lowest = scoresList.length > 0 ? Math.min(...scoresList) : 0;
  const average = scoresList.length > 0
    ? (scoresList.reduce((a, b) => a + b, 0) / scoresList.length).toFixed(2)
    : "—";
  const totalExams = scores.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Scores</h1>
          <p className="text-lg text-gray-600 mt-2">
            Department: <span className="font-semibold">{adminDepartment || "Loading..."}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <FiUsers className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-600">Total Exams</h3>
            </div>
            <p className="text-4xl font-bold text-blue-700">{totalExams}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <FiAward className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-medium text-gray-600">Highest Score</h3>
            </div>
            <p className="text-4xl font-bold text-green-600">{highest}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-medium text-gray-600">Lowest Score</h3>
            </div>
            <p className="text-4xl font-bold text-red-600">{lowest}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <FiTrendingUp className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-medium text-gray-600">Average Score</h3>
            </div>
            <p className="text-4xl font-bold text-indigo-600">{average}</p>
          </div>
        </div>

        {/* Scores Table */}
        {scores.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow text-center border border-gray-200">
            <FiAlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              No Scores Available
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              There are currently no student scores recorded in the
              <strong> {adminDepartment} </strong> department.
              <br /><br />
              Scores will appear here once students complete exams.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scores.map((score) => (
                    <tr
                      key={score.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        score.score === highest
                          ? "bg-green-50"
                          : score.score === lowest
                          ? "bg-red-50"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">{score.studentName.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{score.studentName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {score.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {score.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {score.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentScores;