import React, { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Download,
  ChevronRight,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  Eye,
  Printer,
  Share2,
  Star,
  Medal,
  Trophy,
  PieChart,
  DownloadCloud,
  Mail,
  FileText,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  User
} from "lucide-react";

const StudentResults = ({ studentInfo, onBack }) => {
  const [selectedResult, setSelectedResult] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showDetailed, setShowDetailed] = useState(false);

  // Mock student data (in real app, this would come from props or API)
  const student = {
    name: "Tejas Khope",
    enrollmentNo: "TGPCET2024001",
    department: "Computer Science",
    semester: "4th Semester",
    rollNo: "CS042",
    batch: "2024-2028",
    avatar: "https://ui-avatars.com/api/?name=Tejas+Khope&background=0D8F81&color=fff&size=100"
  };

  // Mock results data - ONLY for this specific student
  const results = [
    {
      id: 1,
      title: "Data Structures & Algorithms",
      subject: "Computer Science",
      subjectCode: "CS301",
      examDate: "2024-02-15",
      duration: 120,
      totalMarks: 100,
      obtainedMarks: 85,
      percentage: 85,
      grade: "A",
      rank: 12,
      totalStudents: 150,
      status: "passed",
      instructor: "Dr. Sharma",
      semester: "4th Semester",
      examType: "Mid Semester",
      topics: [
        { name: "Arrays", correct: 22, total: 25, percentage: 88 },
        { name: "Linked Lists", correct: 23, total: 25, percentage: 92 },
        { name: "Trees", correct: 20, total: 25, percentage: 80 },
        { name: "Graphs", correct: 20, total: 25, percentage: 80 }
      ],
      feedback: "Excellent understanding of data structures. Keep up the good work!",
      strengths: ["Problem solving", "Algorithm analysis", "Code optimization"],
      weaknesses: ["Graph algorithms need improvement"],
      answerSummary: [
        { questionNo: 1, status: "correct", marks: 2 },
        { questionNo: 2, status: "correct", marks: 2 },
        { questionNo: 3, status: "correct", marks: 2 },
        { questionNo: 4, status: "incorrect", marks: 0 },
        { questionNo: 5, status: "correct", marks: 2 }
      ]
    },
    {
      id: 2,
      title: "Database Management Systems",
      subject: "Computer Science",
      subjectCode: "CS302",
      examDate: "2024-02-10",
      duration: 90,
      totalMarks: 80,
      obtainedMarks: 72,
      percentage: 90,
      grade: "A+",
      rank: 5,
      totalStudents: 145,
      status: "passed",
      instructor: "Prof. Patel",
      semester: "4th Semester",
      examType: "End Semester",
      topics: [
        { name: "SQL Queries", correct: 20, total: 20, percentage: 100 },
        { name: "Normalization", correct: 18, total: 20, percentage: 90 },
        { name: "Transactions", correct: 18, total: 20, percentage: 90 },
        { name: "Indexing", correct: 16, total: 20, percentage: 80 }
      ],
      feedback: "Outstanding performance in database concepts!",
      strengths: ["SQL mastery", "Query optimization", "Database design"],
      weaknesses: [],
      answerSummary: [
        { questionNo: 1, status: "correct", marks: 2 },
        { questionNo: 2, status: "correct", marks: 2 },
        { questionNo: 3, status: "correct", marks: 2 },
        { questionNo: 4, status: "correct", marks: 2 },
        { questionNo: 5, status: "correct", marks: 2 }
      ]
    },
    {
      id: 3,
      title: "Operating Systems",
      subject: "Computer Science",
      subjectCode: "CS303",
      examDate: "2024-02-05",
      duration: 120,
      totalMarks: 90,
      obtainedMarks: 45,
      percentage: 50,
      grade: "C",
      rank: 98,
      totalStudents: 148,
      status: "passed",
      instructor: "Dr. Kumar",
      semester: "4th Semester",
      examType: "Mid Semester",
      topics: [
        { name: "Process Management", correct: 12, total: 20, percentage: 60 },
        { name: "Memory Management", correct: 9, total: 20, percentage: 45 },
        { name: "File Systems", correct: 11, total: 20, percentage: 55 },
        { name: "Scheduling", correct: 8, total: 20, percentage: 40 }
      ],
      feedback: "Needs improvement in process scheduling concepts.",
      strengths: ["Basic concepts clear"],
      weaknesses: ["Scheduling algorithms", "Memory paging", "Deadlock handling"],
      answerSummary: [
        { questionNo: 1, status: "correct", marks: 2 },
        { questionNo: 2, status: "incorrect", marks: 0 },
        { questionNo: 3, status: "correct", marks: 2 },
        { questionNo: 4, status: "incorrect", marks: 0 },
        { questionNo: 5, status: "incorrect", marks: 0 }
      ]
    },
    {
      id: 4,
      title: "Computer Networks",
      subject: "Computer Science",
      subjectCode: "CS304",
      examDate: "2024-01-28",
      duration: 120,
      totalMarks: 100,
      obtainedMarks: 92,
      percentage: 92,
      grade: "A+",
      rank: 3,
      totalStudents: 152,
      status: "passed",
      instructor: "Prof. Gupta",
      semester: "4th Semester",
      examType: "End Semester",
      topics: [
        { name: "OSI Model", correct: 25, total: 25, percentage: 100 },
        { name: "TCP/IP", correct: 24, total: 25, percentage: 96 },
        { name: "Routing", correct: 22, total: 25, percentage: 88 },
        { name: "Network Security", correct: 21, total: 25, percentage: 84 }
      ],
      feedback: "Exceptional performance! One of the top scorers.",
      strengths: ["Network protocols", "OSI model", "TCP/IP stack"],
      weaknesses: [],
      answerSummary: [
        { questionNo: 1, status: "correct", marks: 2 },
        { questionNo: 2, status: "correct", marks: 2 },
        { questionNo: 3, status: "correct", marks: 2 },
        { questionNo: 4, status: "correct", marks: 2 },
        { questionNo: 5, status: "correct", marks: 2 }
      ]
    },
    {
      id: 5,
      title: "Software Engineering",
      subject: "Computer Science",
      subjectCode: "CS305",
      examDate: "2024-01-20",
      duration: 90,
      totalMarks: 75,
      obtainedMarks: 68,
      percentage: 90.67,
      grade: "A",
      rank: 8,
      totalStudents: 140,
      status: "passed",
      instructor: "Dr. Singh",
      semester: "4th Semester",
      examType: "Mid Semester",
      topics: [
        { name: "SDLC", correct: 18, total: 20, percentage: 90 },
        { name: "Agile", correct: 17, total: 20, percentage: 85 },
        { name: "UML Diagrams", correct: 18, total: 20, percentage: 90 },
        { name: "Testing", correct: 15, total: 15, percentage: 100 }
      ],
      feedback: "Very good understanding of software development lifecycle.",
      strengths: ["SDLC models", "Agile methodology", "UML diagrams"],
      weaknesses: ["Testing strategies need more practice"],
      answerSummary: [
        { questionNo: 1, status: "correct", marks: 2 },
        { questionNo: 2, status: "correct", marks: 2 },
        { questionNo: 3, status: "incorrect", marks: 0 },
        { questionNo: 4, status: "correct", marks: 2 },
        { questionNo: 5, status: "correct", marks: 2 }
      ]
    }
  ];

  // Calculate statistics for this student
  const stats = {
    totalExams: results.length,
    passedExams: results.filter(r => r.status === "passed").length,
    averagePercentage: (results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(2),
    totalMarks: results.reduce((acc, r) => acc + r.totalMarks, 0),
    obtainedMarks: results.reduce((acc, r) => acc + r.obtainedMarks, 0),
    highestScore: Math.max(...results.map(r => r.percentage)),
    lowestScore: Math.min(...results.map(r => r.percentage)),
    bestSubject: results.reduce((best, curr) => curr.percentage > best.percentage ? curr : best, results[0]),
    aGrades: results.filter(r => r.grade.startsWith('A')).length,
    bGrades: results.filter(r => r.grade.startsWith('B')).length,
    cGrades: results.filter(r => r.grade.startsWith('C')).length
  };

  // Filter results
  const filteredResults = results.filter(result => {
    if (filter === "passed" && result.status !== "passed") return false;
    if (filter === "aGrade" && !result.grade.startsWith('A')) return false;
    if (filter === "bGrade" && !result.grade.startsWith('B')) return false;
    if (filter === "cGrade" && !result.grade.startsWith('C')) return false;
    if (filter === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(result.examDate) >= thirtyDaysAgo;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        result.title.toLowerCase().includes(query) ||
        result.subject.toLowerCase().includes(query) ||
        result.examType.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Get grade color
  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get performance color
  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get rank icon
  const getRankIcon = (rank) => {
    if (rank <= 5) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank <= 10) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank <= 20) return <Star className="w-4 h-4 text-amber-500" />;
    return null;
  };

  // Detailed Result View Modal
  const DetailedResultModal = ({ result, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with student info */}
        <div className={`p-6 text-white rounded-t-2xl ${
          result.percentage >= 75 ? 'bg-gradient-to-r from-green-600 to-green-700' :
          result.percentage >= 60 ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
          result.percentage >= 40 ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' :
          'bg-gradient-to-r from-red-600 to-red-700'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold">{result.title}</h2>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{result.examType}</span>
              </div>
              <p className="opacity-90">{result.subject} • {result.subjectCode}</p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{new Date(result.examDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{result.duration} mins</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">{result.instructor}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Student Info Card */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center space-x-4">
            <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full" />
            <div>
              <p className="font-medium text-gray-800">{student.name}</p>
              <p className="text-sm text-gray-500">{student.enrollmentNo} • {student.department} • {student.semester}</p>
            </div>
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <p className="text-sm text-blue-600 mb-1">Your Score</p>
              <p className="text-2xl font-bold text-blue-700">{result.obtainedMarks}/{result.totalMarks}</p>
              <p className="text-xs text-blue-500 mt-1">{result.percentage}%</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <p className="text-sm text-purple-600 mb-1">Grade</p>
              <p className="text-2xl font-bold text-purple-700">{result.grade}</p>
              <p className="text-xs text-purple-500 mt-1">
                {result.percentage >= 90 ? 'Outstanding' :
                 result.percentage >= 75 ? 'Excellent' :
                 result.percentage >= 60 ? 'Good' :
                 result.percentage >= 40 ? 'Average' : 'Needs Work'}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
              <p className="text-sm text-orange-600 mb-1">Class Rank</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-orange-700">#{result.rank}</p>
                {getRankIcon(result.rank)}
              </div>
              <p className="text-xs text-orange-500 mt-1">Out of {result.totalStudents} students</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <p className="text-sm text-green-600 mb-1">Percentage</p>
              <p className="text-2xl font-bold text-green-700">{result.percentage}%</p>
              <p className="text-xs text-green-500 mt-1">
                {result.percentage >= 75 ? 'Above Average' :
                 result.percentage >= 60 ? 'Average' : 'Below Average'}
              </p>
            </div>
          </div>

          {/* Topic-wise Performance */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Topic-wise Performance</h3>
            <div className="space-y-3">
              {result.topics.map((topic, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{topic.name}</span>
                    <span className="font-medium">{topic.correct}/{topic.total} ({topic.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        topic.percentage >= 75 ? 'bg-green-500' :
                        topic.percentage >= 60 ? 'bg-blue-500' :
                        topic.percentage >= 40 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${topic.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Answer Summary */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Question-wise Summary</h3>
            <div className="grid grid-cols-5 gap-2">
              {result.answerSummary.map((q, i) => (
                <div key={i} className={`p-3 rounded-lg text-center ${
                  q.status === 'correct' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <p className="text-xs text-gray-500">Q{q.questionNo}</p>
                  {q.status === 'correct' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto mt-1" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mx-auto mt-1" />
                  )}
                  <p className="text-xs mt-1 font-medium">{q.marks} marks</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {result.strengths.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-medium text-green-700 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Your Strengths
                </h4>
                <ul className="space-y-1">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-green-600 flex items-start">
                      <span className="mr-2">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.weaknesses.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h4 className="font-medium text-yellow-700 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Areas to Improve
                </h4>
                <ul className="space-y-1">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-yellow-600 flex items-start">
                      <span className="mr-2">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Feedback */}
          {result.feedback && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Instructor's Feedback
              </h4>
              <p className="text-sm text-blue-600 italic">"{result.feedback}"</p>
              <p className="text-xs text-blue-500 mt-2">- {result.instructor}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Printer className="w-4 h-4" />
              <span>Print Result</span>
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share Result</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Results</h1>
                <p className="text-sm text-gray-500">View your exam performance and progress</p>
              </div>
            </div>
            
            {/* Student Quick Info */}
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">{student.name}</p>
                <p className="text-xs text-gray-500">{student.enrollmentNo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Student Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Exams</span>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalExams}</p>
            <p className="text-xs text-gray-400 mt-1">{stats.passedExams} passed</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Average Score</span>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.averagePercentage}%</p>
            <p className="text-xs text-gray-400 mt-1">{stats.obtainedMarks}/{stats.totalMarks} marks</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Highest Score</span>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.highestScore}%</p>
            <p className="text-xs text-gray-400 mt-1">{stats.bestSubject.title}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Grade Summary</span>
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChart className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">A: {stats.aGrades}</span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">B: {stats.bGrades}</span>
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-600 rounded">C: {stats.cGrades}</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Filter:</span>
              <button 
                onClick={() => setFilter("all")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === "all" ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter("recent")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === "recent" ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Last 30 Days
              </button>
              <button 
                onClick={() => setFilter("aGrade")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === "aGrade" ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                A Grade
              </button>
              <button 
                onClick={() => setFilter("bGrade")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === "bGrade" ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                B Grade
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <button 
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {viewMode === "grid" ? <BarChart3 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.map(result => (
              <div 
                key={result.id} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedResult(result)}
              >
                {/* Card Header with Color based on performance */}
                <div className={`h-2 ${
                  result.percentage >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  result.percentage >= 75 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  result.percentage >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-r from-orange-500 to-orange-600'
                }`}></div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{result.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{result.subject} • {result.examType}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                      Grade {result.grade}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{new Date(result.examDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getRankIcon(result.rank)}
                      <span className="text-xs text-gray-500">Rank #{result.rank}</span>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Your Score</p>
                      <p className="text-lg font-bold text-gray-800">{result.obtainedMarks}/{result.totalMarks}</p>
                    </div>
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#e5e7eb"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={
                            result.percentage >= 90 ? '#22c55e' :
                            result.percentage >= 75 ? '#3b82f6' :
                            result.percentage >= 60 ? '#eab308' :
                            '#f97316'
                          }
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - result.percentage / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-bold ${getPerformanceColor(result.percentage)}`}>
                          {result.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button className="w-full mt-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1 text-sm">
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map(result => (
                  <tr key={result.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedResult(result)}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{result.title}</p>
                        <p className="text-xs text-gray-500">{result.examType}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(result.examDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{result.obtainedMarks}/{result.totalMarks}</span>
                        <span className={`text-xs ${getPerformanceColor(result.percentage)}`}>
                          ({result.percentage}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        {getRankIcon(result.rank)}
                        <span className="text-sm">#{result.rank}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResult(result);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No results found</h3>
            <p className="text-gray-500">No exam results match your current filters.</p>
          </div>
        )}
      </div>

      {/* Detailed Result Modal */}
      {selectedResult && (
        <DetailedResultModal 
          result={selectedResult} 
          onClose={() => setSelectedResult(null)} 
        />
      )}
    </div>
  );
};

export default StudentResults;