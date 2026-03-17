// pages/admin/ExamAttempts.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft, FiRefreshCw, FiAlertCircle, FiCheckCircle,
  FiXCircle, FiRotateCcw, FiSearch, FiX, FiUsers,
  FiStar, FiAward, FiFileText, FiAlertTriangle,
} from "react-icons/fi";

// ✅ baseURL = /api (not /api/admin)
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
axiosInstance.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  else { window.location.href = "/"; return Promise.reject(); }
  return cfg;
});
axiosInstance.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) { localStorage.clear(); window.location.href = "/"; }
    return Promise.reject(new Error(err.response?.data?.message || err.message));
  }
);

const GRADE_STYLE = {
  O: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  A: { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200"    },
  B: { bg: "bg-indigo-100",  text: "text-indigo-700",  border: "border-indigo-200"  },
  C: { bg: "bg-yellow-100",  text: "text-yellow-700",  border: "border-yellow-200"  },
  D: { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200"  },
  F: { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200"     },
};

const DEPT_STYLE = {
  IT:  { bg: "bg-purple-600", light: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  CS:  { bg: "bg-blue-600",   light: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  CE:  { bg: "bg-green-600",  light: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  ECE: { bg: "bg-yellow-500", light: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
};

const fmt = (iso) => iso ? new Date(iso).toLocaleString("en-IN", {
  day:"2-digit", month:"short", year:"numeric",
  hour:"2-digit", minute:"2-digit", hour12:true,
}) : "—";

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5
    rounded-xl shadow-2xl text-sm font-semibold max-w-sm
    ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}>
    {type === "success"
      ? <FiCheckCircle className="w-4 h-4 shrink-0" />
      : <FiAlertCircle className="w-4 h-4 shrink-0" />}
    <span className="flex-1">{message}</span>
    <button onClick={onClose}><FiX className="w-4 h-4 opacity-70 hover:opacity-100" /></button>
  </div>
);

// ─── Reschedule Modal ─────────────────────────────────────────────────────────
const RescheduleModal = ({ student, onConfirm, onCancel, loading }) => {
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiRotateCcw className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-center text-gray-800 mb-1">Reschedule Exam</h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          Reset <strong className="text-gray-800">{student?.fullName || student?.studentId}</strong>'s
          attempt so they can retake the exam.
        </p>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Reason / Note (optional)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Technical issue, accidental submission, admin approved re-attempt…"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold
              text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(note)} disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl
              text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
              ? <><FiRefreshCw className="w-4 h-4 animate-spin" /> Rescheduling…</>
              : <><FiRotateCcw className="w-4 h-4" /> Reschedule</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const ExamAttempts = () => {
  const navigate    = useNavigate();
  const { id }      = useParams(); // ✅ real exam ObjectId from URL

  const adminDept = localStorage.getItem("adminDepartment") || "";
  const ds        = DEPT_STYLE[adminDept] || DEPT_STYLE["CS"];

  // Auth guard
  useEffect(() => {
    const role  = localStorage.getItem("userRole");
    const dept  = localStorage.getItem("adminDepartment");
    const token = localStorage.getItem("token");
    if (!token || role !== "admin" || !dept) navigate("/");
  }, []); // eslint-disable-line

  const [examInfo,     setExamInfo]     = useState(null);
  const [attempts,     setAttempts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [rescTarget,   setRescTarget]   = useState(null);
  const [reschLoading, setReschLoading] = useState(false);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ✅ API call uses /admin/exams/${id}/attempts
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/admin/exams/${id}/attempts`);
      setExamInfo(res.data.exam);
      setAttempts(res.data.attempts || []);
    } catch (e) {
      setError(e.message || "Failed to load attempts");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ✅ Reschedule uses /admin/exams/${id}/attempts/${studentId}/reschedule
  const handleReschedule = async (note) => {
    if (!rescTarget) return;
    setReschLoading(true);
    try {
      await axiosInstance.delete(
        `/admin/exams/${id}/attempts/${rescTarget._id}/reschedule`,
        { data: { note } }
      );
      showToast(`Exam rescheduled for ${rescTarget.fullName || rescTarget.studentId}`);
      setRescTarget(null);
      load();
    } catch (e) {
      showToast(e.message || "Failed to reschedule", "error");
    } finally {
      setReschLoading(false);
    }
  };

  const filtered = attempts.filter(a => {
    const q = search.toLowerCase();
    return !q
      || a.student?.fullName?.toLowerCase().includes(q)
      || a.student?.studentId?.toLowerCase().includes(q)
      || a.student?.email?.toLowerCase().includes(q);
  });

  const stats = {
    total:  attempts.length,
    passed: attempts.filter(a => a.percentage >= 40).length,
    avg:    attempts.length
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
      : 0,
    term:   attempts.filter(a => a.status === "terminated").length,
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      {rescTarget && (
        <RescheduleModal
          student={rescTarget}
          loading={reschLoading}
          onConfirm={handleReschedule}
          onCancel={() => setRescTarget(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/exams")}
              className="p-2.5 border border-gray-300 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <FiArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Exam Attempts</h1>
              {examInfo && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {examInfo.subject}
                  {" · "}
                  <span className={`font-semibold ${ds.text}`}>{adminDept}</span>
                  {" · Total marks: "}
                  <strong>{examInfo.totalMarks}</strong>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={load}
            className="p-2.5 border border-gray-300 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ── ERROR ──────────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <FiAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={load} className="ml-auto text-xs text-red-600 underline font-medium">
              Retry
            </button>
          </div>
        )}

        {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Submitted",     val: stats.total,      icon: FiUsers,         color: "text-gray-700",  bg: "bg-gray-100"  },
              { label: "Passed (≥40%)", val: stats.passed,     icon: FiCheckCircle,   color: "text-green-600", bg: "bg-green-50"  },
              { label: "Avg Score",     val: `${stats.avg}%`,  icon: FiAward,         color: "text-blue-600",  bg: "bg-blue-50"   },
              { label: "Terminated",    val: stats.term,       icon: FiAlertTriangle, color: "text-red-600",   bg: "bg-red-50"    },
            ].map(({ label, val, icon: Icon, color, bg }) => (
              <div key={label}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
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

        {/* ── SEARCH ─────────────────────────────────────────────────────── */}
        <div className="relative mb-5">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, ID or email…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── TABLE ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-700">
              {loading
                ? "Loading…"
                : `${filtered.length} student${filtered.length !== 1 ? "s" : ""} attempted`}
            </p>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="divide-y divide-gray-100">
              {[1,2,3,4].map(i => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="h-4 bg-gray-200 rounded-full animate-pulse w-40" />
                  <div className="h-4 bg-gray-200 rounded-full animate-pulse w-24 ml-auto" />
                  <div className="h-4 bg-gray-200 rounded-full animate-pulse w-16" />
                  <div className="h-4 bg-gray-200 rounded-full animate-pulse w-20" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold mb-1">
                {search
                  ? "No students match your search"
                  : "No students have attempted this exam yet"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-indigo-600 underline mt-2">
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Data table */}
          {!loading && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Student", "Student ID", "Score", "Grade",
                      "Correct", "Wrong", "Unanswered", "Marks/Q",
                      "Status", "Submitted At", "Action",
                    ].map(h => (
                      <th key={h}
                        className="px-5 py-3 text-left text-xs font-bold text-gray-400
                          uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filtered.map(a => {
                    const gs = GRADE_STYLE[a.grade] || GRADE_STYLE["F"];
                    return (
                      <tr key={a.attemptId} className="hover:bg-gray-50 transition-colors">

                        {/* Student */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-800">
                            {a.student.fullName}
                          </p>
                          <p className="text-xs text-gray-400">{a.student.email}</p>
                        </td>

                        {/* Student ID */}
                        <td className="px-5 py-4 text-sm text-gray-600 font-mono">
                          {a.student.studentId}
                        </td>

                        {/* Score */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-800">
                            {a.score}/{a.totalMarks}
                          </p>
                          <p className="text-xs text-gray-400">{a.percentage}%</p>
                        </td>

                        {/* Grade */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1
                            rounded-full text-xs font-black border
                            ${gs.bg} ${gs.text} ${gs.border}`}>
                            {a.grade}
                          </span>
                        </td>

                        {/* Correct */}
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-sm text-emerald-600 font-semibold">
                            <FiCheckCircle className="w-3.5 h-3.5" /> {a.correctCount}
                          </span>
                        </td>

                        {/* Wrong */}
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-sm text-red-500">
                            <FiXCircle className="w-3.5 h-3.5" /> {a.wrongCount}
                          </span>
                        </td>

                        {/* Unanswered */}
                        <td className="px-5 py-4 text-sm text-gray-400 font-medium">
                          {a.unansweredCount}
                        </td>

                        {/* Marks/Q */}
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                            <FiStar className="w-3 h-3" /> {a.marksPerQuestion}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                            ${a.status === "submitted"
                              ? "bg-green-100 text-green-700"
                              : a.status === "terminated"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"}`}>
                            {a.status}
                          </span>
                          {a.terminationReason && (
                            <p className="text-xs text-red-400 mt-0.5 max-w-[120px] truncate"
                              title={a.terminationReason}>
                              {a.terminationReason}
                            </p>
                          )}
                        </td>

                        {/* Submitted At */}
                        <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                          {fmt(a.submittedAt)}
                        </td>

                        {/* Action — Reschedule */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setRescTarget(a.student)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                              text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg
                              transition-colors whitespace-nowrap">
                            <FiRotateCcw className="w-3.5 h-3.5" /> Reschedule
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamAttempts;