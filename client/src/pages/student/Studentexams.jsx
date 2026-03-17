// pages/student/StudentExams.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentExams } from "../../store/slices/examSlices";
import axios from "axios";
import {
  Clock, Calendar, Play, BookOpen, FileText, Award,
  Search, X, AlertCircle, RefreshCw, Inbox, Camera,
  ChevronRight, CheckCircle, Lock, Star,
} from "lucide-react";
import { StudentLayout } from "../../components/student/StudentLayout";
import ExamInterface from "./ExamInterface";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  else { window.location.href = "/"; return Promise.reject(); }
  return cfg;
});

const STATUS = {
  active:    { label: "Live",     bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  upcoming:  { label: "Upcoming", bg: "bg-blue-100",  text: "text-blue-700",  dot: "bg-blue-400"  },
  completed: { label: "Done",     bg: "bg-gray-100",  text: "text-gray-500",  dot: "bg-gray-400"  },
};

const fmt = (iso, opts) => new Date(iso).toLocaleString("en-IN", opts);

const GuidelinesModal = ({ exam, onStart, onClose, starting }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
      <div className="p-5 border-b flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold">Start Exam</h2>
          <p className="text-sm text-blue-600 font-semibold">{exam?.subject}</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Duration",    val: `${exam?.duration} min`         },
            { label: "Questions",   val: exam?.questionCount ?? 0         },
            { label: "Total Marks", val: (exam?.questionCount ?? 0) * (exam?.marksPerQuestion ?? 1) },
          ].map(({ label, val }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-base font-bold text-gray-800">{val}</p>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">⚠ Important — Read before starting:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>You can attempt this exam <strong>only once</strong></li>
              <li>Camera must stay ON — face must be visible</li>
              <li>10 sec face away = 1 warning · 5 warnings = auto-terminated</li>
              <li>Do NOT switch tabs or exit fullscreen</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onStart} disabled={starting}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold
              hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50">
            {starting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {starting ? "Starting…" : "Start Exam"}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
const StudentExams = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { studentList: exams, loading, error } = useSelector(s => s.exams);

  useEffect(() => {
    const t = localStorage.getItem("token"), r = localStorage.getItem("userRole");
    if (!t || r !== "student") navigate("/");
  }, []); // eslint-disable-line

  useEffect(() => { dispatch(fetchStudentExams()); }, [dispatch]);

  const [search,         setSearch]         = useState("");
  const [filter,         setFilter]         = useState("all");
  const [selectedExam,   setSelectedExam]   = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [starting,       setStarting]       = useState(false);
  const [examStarted,    setExamStarted]    = useState(false);

  // ── Track attempt status per exam ─────────────────────────────────────────
  // { [examId]: { attempted: bool, score, totalMarks, percentage, grade, submittedAt } }
  const [attemptMap, setAttemptMap] = useState({});
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Fetch attempt status for all active/completed exams
  const fetchAttemptStatuses = useCallback(async (examList) => {
    if (!examList?.length) return;
    // Only check exams that are active or completed (not upcoming)
    const relevant = examList.filter(e => e.status === "active" || e.status === "completed");
    if (!relevant.length) return;

    setLoadingAttempts(true);
    try {
      const results = await Promise.allSettled(
        relevant.map(e => api.get(`/student/exams/${e._id}/attempt-status`))
      );
      const map = {};
      results.forEach((res, i) => {
        if (res.status === "fulfilled") {
          map[relevant[i]._id] = res.value.data;
        }
      });
      setAttemptMap(map);
    } catch { /* silent */ }
    finally { setLoadingAttempts(false); }
  }, []);

  useEffect(() => {
    if (exams?.length) fetchAttemptStatuses(exams);
  }, [exams, fetchAttemptStatuses]);

  const filtered = (exams || []).filter(e =>
    (filter === "all" || e.status === filter) &&
    (!search || e.subject.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStart = (exam) => { setSelectedExam(exam); setShowGuidelines(true); };

  const beginExam = async () => {
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      await document.documentElement.requestFullscreen?.().catch(() => {});
      setShowGuidelines(false);
      setExamStarted(true);
    } catch {
      alert("Camera access is required to start the exam.");
    } finally {
      setStarting(false);
    }
  };

  const handleExamEnd = () => {
    setExamStarted(false);
    setSelectedExam(null);
    dispatch(fetchStudentExams());
    // Re-fetch attempt statuses after exam ends
    setTimeout(() => fetchAttemptStatuses(exams), 1000);
  };

  if (examStarted && selectedExam)
    return <ExamInterface exam={selectedExam} onExamEnd={handleExamEnd} />;

  return (
    <StudentLayout>
      <div className="p-6 max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Exams</h1>
            <p className="text-sm text-gray-400 mt-0.5">All exams for your department</p>
          </div>
          <button onClick={() => dispatch(fetchStudentExams())}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by subject…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
          </div>
          <div className="flex gap-2">
            {["all","active","upcoming","completed"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors
                  ${filter === s ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                {s === "active" ? "Live" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => dispatch(fetchStudentExams())} className="ml-auto text-xs text-red-600 underline">Retry</button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">
              {search || filter !== "all" ? "No exams match your filters" : "No exams found"}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-600">{filtered.length} exam{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {filtered.map(exam => {
                const s         = STATUS[exam.status] || STATUS.upcoming;
                const isActive  = exam.status === "active";
                const isDone    = exam.status === "completed";
                const attempt   = attemptMap[exam._id];
                const attempted = attempt?.attempted === true;
                const totalMarks = (exam.questionCount ?? 0) * (exam.marksPerQuestion ?? 1);

                return (
                  <div key={exam._id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
                      ${attempted ? "bg-emerald-50 border-emerald-200"
                        : isActive ? "bg-green-50 border-green-200"
                        : isDone   ? "bg-purple-50 border-purple-100"
                        : "bg-blue-50 border-blue-100"}`}>
                      {attempted
                        ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                        : <BookOpen className={`w-4 h-4 ${isActive ? "text-green-600" : isDone ? "text-purple-500" : "text-blue-500"}`} />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 text-sm">{exam.subject}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${isActive ? "animate-pulse" : ""}`} />
                          {s.label}
                        </span>
                        {attempted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                            ✓ Submitted
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                          {fmt(exam.startTime, { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit", hour12:true })}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.duration} min</span>
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{exam.questionCount ?? 0} Qs</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3" />{exam.marksPerQuestion ?? 1}/Q</span>
                        <span className="flex items-center gap-1"><Award className="w-3 h-3" />{totalMarks} marks</span>
                        {/* Show score if attempted */}
                        {attempted && attempt.score !== undefined && (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            Score: {attempt.score}/{attempt.totalMarks} ({attempt.percentage}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    {isActive && !attempted && (
                      <button onClick={() => handleStart(exam)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700
                          text-white text-xs font-bold rounded-xl shadow transition-colors shrink-0">
                        <Play className="w-3.5 h-3.5 fill-white" /> Start
                      </button>
                    )}

                    {/* Already attempted — locked */}
                    {isActive && attempted && (
                      <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl shrink-0">
                        <Lock className="w-3.5 h-3.5" /> Submitted
                      </div>
                    )}

                    {isDone && attempted && (
                      <button onClick={() => navigate("/student/results")}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100
                          text-indigo-700 text-xs font-bold rounded-xl transition-colors shrink-0">
                        View Result <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isDone && !attempted && (
                      <span className="text-xs text-red-400 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg shrink-0">
                        Missed
                      </span>
                    )}

                    {exam.status === "upcoming" && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg shrink-0">
                        Not started
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showGuidelines && (
        <GuidelinesModal exam={selectedExam} onStart={beginExam}
          onClose={() => { setShowGuidelines(false); setSelectedExam(null); }}
          starting={starting} />
      )}
    </StudentLayout>
  );
};

export default StudentExams;