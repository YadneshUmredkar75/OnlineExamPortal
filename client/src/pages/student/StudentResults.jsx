// pages/student/StudentResults.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Award, CheckCircle, XCircle, FileText, Calendar,
  RefreshCw, AlertCircle, Inbox, Star, TrendingUp, Clock,
} from "lucide-react";
import { StudentLayout } from "../../components/student/StudentLayout";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  else { window.location.href = "/"; return Promise.reject(); }
  return cfg;
});

const GRADE_STYLE = {
  O: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", label: "Outstanding" },
  A: { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200",    label: "Excellent"   },
  B: { bg: "bg-indigo-100",  text: "text-indigo-700",  border: "border-indigo-200",  label: "Good"        },
  C: { bg: "bg-yellow-100",  text: "text-yellow-700",  border: "border-yellow-200",  label: "Average"     },
  D: { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200",  label: "Pass"        },
  F: { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200",     label: "Fail"        },
};

const STATUS_STYLE = {
  submitted:   { bg: "bg-green-100",  text: "text-green-700",  label: "Submitted"   },
  terminated:  { bg: "bg-red-100",    text: "text-red-700",    label: "Terminated"  },
  rescheduled: { bg: "bg-blue-100",   text: "text-blue-700",   label: "Rescheduled" },
};

const fmt = (iso) => iso ? new Date(iso).toLocaleString("en-IN", {
  day: "2-digit", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit", hour12: true,
}) : "—";

// ─── Donut ring ───────────────────────────────────────────────────────────────
const Ring = ({ pct, grade }) => {
  const gs    = GRADE_STYLE[grade] || GRADE_STYLE["F"];
  const r     = 36;
  const circ  = 2 * Math.PI * r;
  const dash  = (pct / 100) * circ;
  const color = { O:"#10b981", A:"#3b82f6", B:"#6366f1", C:"#eab308", D:"#f97316", F:"#ef4444" }[grade] || "#6b7280";
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-black text-gray-800">{pct}%</span>
        <span className={`text-xs font-bold ${gs.text}`}>{grade}</span>
      </div>
    </div>
  );
};

// ─── Detail modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ result, onClose }) => {
  const gs = GRADE_STYLE[result.grade] || GRADE_STYLE["F"];
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className={`px-6 py-5 ${gs.bg} border-b ${gs.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{result.subject}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{fmt(result.submittedAt)}</p>
            </div>
            <div className={`w-14 h-14 ${gs.bg} border-2 ${gs.border} rounded-full flex flex-col items-center justify-center`}>
              <span className={`text-xl font-black ${gs.text}`}>{result.grade}</span>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Score */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs text-gray-400 font-semibold">Score</p>
              <p className="text-2xl font-black text-gray-800">{result.score} <span className="text-gray-400 text-base font-normal">/ {result.totalMarks}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-semibold">Percentage</p>
              <p className={`text-2xl font-black ${gs.text}`}>{result.percentage}%</p>
            </div>
          </div>
          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: CheckCircle, label: "Correct",    val: result.correctCount,    color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: XCircle,     label: "Wrong",      val: result.wrongCount,      color: "text-red-600",     bg: "bg-red-50"     },
              { icon: FileText,    label: "Unanswered", val: result.unansweredCount, color: "text-gray-500",    bg: "bg-gray-50"    },
            ].map(({ icon: Icon, label, val, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                <p className={`text-xl font-black ${color}`}>{val}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
          {/* Marks per Q */}
          <div className="flex items-center justify-between px-4 py-3 bg-yellow-50 border border-yellow-100 rounded-xl">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Marks per question</span>
            </div>
            <span className="text-sm font-bold text-yellow-700">{result.marksPerQuestion}</span>
          </div>
          {/* Status */}
          {result.status === "terminated" && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span className="text-xs text-red-700">Exam was terminated due to proctoring violations</span>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const StudentResults = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = localStorage.getItem("token"), r = localStorage.getItem("userRole");
    if (!t || r !== "student") navigate("/");
  }, []); // eslint-disable-line

  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/student/results");
      setResults(res.data.results || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Summary stats
  const totalExams  = results.length;
  const avgScore    = totalExams > 0 ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / totalExams) : 0;
  const passed      = results.filter(r => r.percentage >= 40).length;
  const best        = results.reduce((b, r) => r.percentage > (b?.percentage ?? -1) ? r : b, null);

  return (
    <StudentLayout>
      <div className="p-6 max-w-5xl mx-auto">

        {selected && <DetailModal result={selected} onClose={() => setSelected(null)} />}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Results</h1>
            <p className="text-sm text-gray-400 mt-0.5">All submitted exam results</p>
          </div>
          <button onClick={load} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Summary cards */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Exams",  val: totalExams, icon: FileText,   color: "text-gray-700",    bg: "bg-gray-100"    },
              { label: "Average Score", val: `${avgScore}%`, icon: TrendingUp, color: "text-blue-600",   bg: "bg-blue-50"    },
              { label: "Passed",        val: passed,     icon: CheckCircle, color: "text-green-600",  bg: "bg-green-50"   },
              { label: "Best Score",    val: best ? `${best.percentage}%` : "—", icon: Award, color: "text-indigo-600", bg: "bg-indigo-50" },
            ].map(({ label, val, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`text-xl font-black ${color}`}>{val}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={load} className="ml-auto text-xs text-red-600 underline">Retry</button>
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

        {!loading && results.length === 0 && (
          <div className="text-center py-20">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No results yet</p>
            <p className="text-gray-400 text-sm mt-1">Submitted exam results will appear here</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            {results.map(r => {
              const gs = GRADE_STYLE[r.grade] || GRADE_STYLE["F"];
              const ss = STATUS_STYLE[r.status] || STATUS_STYLE.submitted;
              return (
                <div key={r.attemptId}
                  onClick={() => setSelected(r)}
                  className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-5
                    cursor-pointer hover:shadow-md hover:border-gray-200 transition-all">

                  <Ring pct={r.percentage} grade={r.grade} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-800">{r.subject}</p>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${gs.bg} ${gs.text} ${gs.border}`}>
                        {r.grade} — {gs.label}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ss.bg} ${ss.text}`}>
                        {ss.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle className="w-3 h-3" /> {r.correctCount} correct
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <XCircle className="w-3 h-3" /> {r.wrongCount} wrong
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" /> {r.marksPerQuestion}/Q
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {fmt(r.submittedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black text-gray-800">{r.score}</p>
                    <p className="text-xs text-gray-400">/ {r.totalMarks} marks</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentResults;