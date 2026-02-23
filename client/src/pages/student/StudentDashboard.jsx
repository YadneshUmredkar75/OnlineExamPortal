import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import {
  Clock,
  Calendar,
  Award,
  BookOpen,
  AlertCircle,
  CheckCircle,
  LogOut,
  User,
  Bell,
  Menu,
  Play,
  FileText,
  Camera,
  X,
  ChevronRight,
  TrendingUp,
  Target,
  BarChart3
} from "lucide-react";
import ExamInterface from "./ExamInterface";

const StudentDashboard = () => {
  const navigate = useNavigate(); // Add this hook
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedExam, setSelectedExam] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
    fullscreen: false
  });

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock student data
  const studentInfo = {
    name: "Tejas Khope",
    enrollmentNo: "TGPCET2024001",
    department: "Computer Science",
    semester: "4th Semester",
    email: "tejas.khope@tgpcet.edu.in",
    avatar: "https://ui-avatars.com/api/?name=Tejas+Khope&background=0D8F81&color=fff&size=100"
  };

  // Mock notifications
  const notifications = [
    { id: 1, message: "Exam starts in 30 minutes", type: "warning", time: "5 min ago" },
    { id: 2, message: "Results for Computer Networks published", type: "success", time: "1 hour ago" },
    { id: 3, message: "New exam scheduled for next week", type: "info", time: "2 hours ago" }
  ];

  // Mock exams data
  const examsData = {
    upcoming: [
      {
        id: 1,
        title: "Data Structures & Algorithms",
        subject: "Computer Science",
        scheduledDate: "2024-02-25",
        scheduledTime: "10:00 AM",
        duration: 120,
        totalQuestions: 50,
        totalMarks: 100,
        status: "upcoming",
        room: "Hall A",
        instructor: "Dr. Sharma"
      },
      {
        id: 2,
        title: "Database Management Systems",
        subject: "Computer Science",
        scheduledDate: "2024-02-28",
        scheduledTime: "2:00 PM",
        duration: 90,
        totalQuestions: 40,
        totalMarks: 80,
        status: "upcoming",
        room: "Lab 3",
        instructor: "Prof. Patel"
      }
    ],
    active: [
      {
        id: 3,
        title: "Operating Systems",
        subject: "Computer Science",
        scheduledDate: "2024-02-23",
        scheduledTime: "11:00 AM",
        duration: 120,
        totalQuestions: 45,
        totalMarks: 90,
        status: "active",
        room: "Hall B",
        instructor: "Dr. Kumar",
        instructions: [
          "This exam has 45 multiple choice questions.",
          "Each question carries 2 marks.",
          "No negative marking for wrong answers.",
          "Camera must remain active throughout.",
          "Face and eye movements are monitored.",
          "Looking away from screen counts as violation.",
          "Multiple faces detected will terminate exam.",
          "After 3 violations, exam auto-terminates."
        ]
      }
    ],
    completed: [
      {
        id: 4,
        title: "Computer Networks",
        subject: "Computer Science",
        scheduledDate: "2024-02-20",
        scheduledTime: "9:00 AM",
        duration: 120,
        totalQuestions: 50,
        totalMarks: 100,
        status: "completed",
        score: 85,
        totalScore: 100,
        percentage: 85
      }
    ]
  };

  // Stats calculation with additional metrics
  const stats = {
    upcoming: examsData.upcoming.length,
    active: examsData.active.length,
    completed: examsData.completed.length,
    total: examsData.upcoming.length + examsData.active.length + examsData.completed.length,
    averageScore: 85,
    attendance: 92
  };

  // Handle exam start
  const handleStartExam = (exam) => {
    setSelectedExam(exam);
    setShowGuidelines(true);
  };

  // Handle permission check
  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      });

      setPermissions({ camera: true, microphone: true });

      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setPermissions(prev => ({ ...prev, fullscreen: true }));
      }

      setShowGuidelines(false);
      setExamStarted(true);

    } catch (error) {
      alert("Camera and microphone access are required to start the exam.");
    }
  };

  // Handle exam end
  const handleExamEnd = () => {
    setExamStarted(false);
    setSelectedExam(null);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  // Guidelines Modal - Improved with better styling
  const GuidelinesView = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Exam Guidelines</h2>
              <p className="text-gray-500 mt-1">{selectedExam?.title}</p>
            </div>
            <button
              onClick={() => {
                setShowGuidelines(false);
                setSelectedExam(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Exam Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Duration</span>
                </div>
                <p className="text-xl font-bold text-gray-800">{selectedExam?.duration} mins</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Questions</span>
                </div>
                <p className="text-xl font-bold text-gray-800">{selectedExam?.totalQuestions}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Total Marks</span>
                </div>
                <p className="text-xl font-bold text-gray-800">{selectedExam?.totalMarks}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">Subject</span>
                </div>
                <p className="text-sm font-bold text-gray-800">{selectedExam?.subject}</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                Important Instructions
              </h3>
              <ul className="space-y-3">
                {selectedExam?.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-600">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Proctoring Rules */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <h3 className="font-semibold text-red-700 mb-3 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Proctoring Rules
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-red-700">
                <p className="flex items-center">• Face must be visible</p>
                <p className="flex items-center">• Eyes on screen always</p>
                <p className="flex items-center">• No multiple faces</p>
                <p className="flex items-center">• No tab switching</p>
              </div>
              <p className="text-xs font-bold text-red-700 mt-3 bg-red-100 p-2 rounded">
                ⚠️ After 3 violations, exam auto-terminates!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowGuidelines(false);
              setSelectedExam(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={checkPermissions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>Start Exam</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Notifications Panel
  const NotificationsPanel = () => (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">3 new</span>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map(notification => (
          <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex space-x-3">
              <div className={`p-2 rounded-lg ${notification.type === 'warning' ? 'bg-yellow-100' :
                  notification.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                {notification.type === 'warning' ?
                  <AlertCircle className="w-4 h-4 text-yellow-600" /> :
                  notification.type === 'success' ?
                    <CheckCircle className="w-4 h-4 text-green-600" /> :
                    <Bell className="w-4 h-4 text-blue-600" />
                }
              </div>
              <div>
                <p className="text-sm text-gray-700">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 text-center border-t border-gray-200">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All Notifications
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Enhanced */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-3 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-blue-600">TGPCET</h1>
              <p className="text-xs text-gray-500">Online Examination System</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time Display */}
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-700">{currentTime.toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">{currentTime.toLocaleTimeString()}</p>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {showNotifications && <NotificationsPanel />}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar - Enhanced */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 min-h-screen transition-all duration-300 hidden lg:block`}>
          <div className="p-4">
            {/* Profile Summary - Only when sidebar is open */}
            {sidebarOpen && (
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <img
                  src={studentInfo.avatar}
                  alt={studentInfo.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 border-3 border-blue-500"
                />
                <p className="font-semibold text-gray-800">{studentInfo.name}</p>
                <p className="text-xs text-gray-500 mt-1">{studentInfo.department}</p>
                <p className="text-xs text-gray-400 mt-1">{studentInfo.semester}</p>
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-1">
              <button 
                onClick={() => navigate('/student/dashboard')}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {sidebarOpen && <span className="font-medium">Dashboard</span>}
                {sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>


              {/* FIXED: Results button with proper navigation */}
              <button
                onClick={() => navigate('/student/results')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Award className="w-5 h-5" />
                {sidebarOpen && <span>Results</span>}
              </button>
              {/* Logout Button */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  {sidebarOpen && <span>Logout</span>}
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {/* Welcome Header - Enhanced */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-xl mb-6 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Welcome back, {studentInfo.name.split(' ')[0]}! 👋</h2>
                <p className="text-blue-100 mt-1">Ready for your exams today? You have {stats.active} active exam(s).</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Target className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Stats Cards - Enhanced with better visuals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.upcoming}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Next: Feb 25, 10:00 AM</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">In progress now</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{stats.completed}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Avg. Score: {stats.averageScore}%</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Attendance</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{stats.attendance}%</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">This semester</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Exams</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">All time</p>
            </div>
          </div>

          {/* Active Exams Section - Enhanced */}
          {examsData.active.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Active Exams</h3>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Live Now</span>
              </div>

              {examsData.active.map(exam => (
                <div key={exam.id} className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-800 text-lg">{exam.title}</h4>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{exam.subject} • {exam.room} • {exam.instructor}</p>

                      <div className="flex flex-wrap gap-4">
                        <span className="text-xs flex items-center text-gray-600">
                          <Clock className="w-3 h-3 mr-1" />{exam.duration} mins
                        </span>
                        <span className="text-xs flex items-center text-gray-600">
                          <FileText className="w-3 h-3 mr-1" />{exam.totalQuestions} Questions
                        </span>
                        <span className="text-xs flex items-center text-gray-600">
                          <Award className="w-3 h-3 mr-1" />{exam.totalMarks} Marks
                        </span>
                      </div>

                      <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-700 flex items-center">
                          <Camera className="w-3 h-3 mr-1" />
                          Face & eye tracking active • 3 violations = auto-termination
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartExam(exam)}
                      className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 shadow-md"
                    >
                      <Play className="w-4 h-4" />
                      <span className="font-medium">Start Exam</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Exams Section */}
          {examsData.upcoming.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Exams</h3>
              <div className="space-y-4">
                {examsData.upcoming.map(exam => (
                  <div key={exam.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">{exam.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{exam.subject}</p>
                        <div className="flex space-x-4 mt-2">
                          <span className="text-xs flex items-center text-gray-600">
                            <Calendar className="w-3 h-3 mr-1" />{exam.scheduledDate}
                          </span>
                          <span className="text-xs flex items-center text-gray-600">
                            <Clock className="w-3 h-3 mr-1" />{exam.scheduledTime}
                          </span>
                          <span className="text-xs flex items-center text-gray-600">
                            <FileText className="w-3 h-3 mr-1" />{exam.duration} mins
                          </span>
                        </div>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Exams Section */}
          {examsData.completed.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Results</h3>
              <div className="space-y-4">
                {examsData.completed.map(exam => (
                  <div key={exam.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">{exam.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{exam.subject}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm font-medium text-gray-700">Score: {exam.score}/{exam.totalScore}</span>
                          <span className="text-sm font-medium text-green-600">({exam.percentage}%)</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate('/student/results')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        View Result
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showGuidelines && <GuidelinesView />}
      {examStarted && (
        <ExamInterface
          exam={selectedExam}
          onExamEnd={handleExamEnd}
        />
      )}
    </div>
  );
};

export default StudentDashboard;