import React, { useState } from "react";

const StudentScores = () => {
  const [departmentFilter, setDepartmentFilter] = useState("");

  const scores = [
    { id: 1, studentName: "John Doe", subject: "Mathematics", score: 85, department: "Computer Science" },
    { id: 2, studentName: "Jane Smith", subject: "Physics", score: 92, department: "Information Technology" },
    { id: 3, studentName: "Bob Johnson", subject: "Chemistry", score: 67, department: "Mechanical" },
    { id: 4, studentName: "Alice Brown", subject: "Mathematics", score: 78, department: "Electronics" },
    { id: 5, studentName: "Charlie Wilson", subject: "Physics", score: 45, department: "Computer Science" },
    { id: 6, studentName: "Diana Prince", subject: "Chemistry", score: 95, department: "Information Technology" },
  ];

  const departments = ["All", "Computer Science", "Information Technology", "Electronics", "Mechanical"];

  const filteredScores = scores.filter((score) => 
    departmentFilter === "" || departmentFilter === "All" || score.department === departmentFilter
  );

  const scoresList = filteredScores.map((s) => s.score);
  const highestScore = scoresList.length > 0 ? Math.max(...scoresList) : 0;
  const lowestScore = scoresList.length > 0 ? Math.min(...scoresList) : 0;
  const averageScore = scoresList.length > 0 
    ? (scoresList.reduce((a, b) => a + b, 0) / scoresList.length).toFixed(2) 
    : 0;

  return (
    <div className="page-container">
      <h1 className="page-title">Student Scores</h1>

      <div className="scores-summary">
        <div className="summary-card">
          <h3>Highest Score</h3>
          <p className="highlight">{highestScore}</p>
        </div>
        <div className="summary-card">
          <h3>Lowest Score</h3>
          <p className="lowlight">{lowestScore}</p>
        </div>
        <div className="summary-card">
          <h3>Average Score</h3>
          <p>{averageScore}</p>
        </div>
      </div>

      <div className="filter-section">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="filter-select"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept === "All" ? "All Departments" : dept}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Subject</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredScores.map((score) => (
              <tr
                key={score.id}
                className={
                  score.score === highestScore
                    ? "highest-row"
                    : score.score === lowestScore
                    ? "lowest-row"
                    : ""
                }
              >
                <td>{score.studentName}</td>
                <td>{score.subject}</td>
                <td>{score.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentScores;