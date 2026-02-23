import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock, AlertCircle, Camera, Flag, ChevronLeft, ChevronRight,
  AlertTriangle, Shield, Zap, Users, Eye, Video, Maximize2,
  CheckCircle, XCircle, Award, BarChart3, Download, Home, Loader
} from "lucide-react";

// ─── Script loader helper ────────────────────────────────────────────────────
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(s);
  });

// ─── Constants ───────────────────────────────────────────────────────────────
const FACEAPI_CDN =
  "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
const WEIGHTS_URL =
  "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights";
const VIOLATION_COOLDOWN_MS = 8000;
const DETECTION_INTERVAL_MS = 1500;

const questions = [
  { id: 1, question: "What is a process in operating systems?", options: ["A program in execution","A file on disk","A memory location","A system call"], correctAnswer: 0, marks: 2 },
  { id: 2, question: "Which scheduling algorithm allocates CPU to the first request?", options: ["Round Robin","FCFS (First Come First Serve)","SJF (Shortest Job First)","Priority Scheduling"], correctAnswer: 1, marks: 2 },
  { id: 3, question: "What is paging in memory management?", options: ["Dividing memory into fixed-sized blocks","Increasing CPU speed","Managing I/O devices","Handling interrupts"], correctAnswer: 0, marks: 2 },
  { id: 4, question: "Banker's Algorithm is used for?", options: ["Deadlock avoidance","CPU scheduling","Memory management","File system organization"], correctAnswer: 0, marks: 2 },
  { id: 5, question: "What is a semaphore?", options: ["A synchronization tool","A type of process","A memory management technique","A scheduling algorithm"], correctAnswer: 0, marks: 2 },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const ExamInterface = ({ exam = { title: "Operating Systems Exam", duration: 120 }, onExamEnd = () => {} }) => {
  // ── Exam state ──────────────────────────────────────────────────────────────
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState((exam?.duration ?? 120) * 60);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // ── Detection / proctoring state (display only) ────────────────────────────
  const [cameraActive, setCameraActive] = useState(false);
  const [modelStatus, setModelStatus] = useState("loading"); // loading | ready | fallback | error
  const [faceDetected, setFaceDetected] = useState(true);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [eyesOpen, setEyesOpen] = useState(true);
  const [lookingAway, setLookingAway] = useState(false);
  const [violations, setViolations] = useState(0);
  const [violationHistory, setViolationHistory] = useState([]);

  // ── Refs (used inside intervals – avoids stale closures) ──────────────────
  const videoRef = useRef(null);
  const canvasRef = useRef(null);          // live preview overlay
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const warningTimerRef = useRef(null);
  const violationsRef = useRef(0);         // mirror of violations for intervals
  const lastViolationTimeRef = useRef(0);
  const examEndedRef = useRef(false);
  const cameraActiveRef = useRef(false);   // mirror of cameraActive for intervals
  const modelReadyRef = useRef(false);     // mirror for intervals
  const lastImageDataRef = useRef(null);   // for motion fallback

  // Keep refs in sync with state
  useEffect(() => { violationsRef.current = violations; }, [violations]);

  // ── Format helpers ──────────────────────────────────────────────────────────
  const fmt = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };
  const fmtTaken = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h) return `${h}h ${m}m`; if (m) return `${m}m ${sec}s`; return `${sec}s`;
  };

  // ── Violation handler ───────────────────────────────────────────────────────
  const handleViolation = useCallback((reason) => {
    if (examEndedRef.current) return;
    const now = Date.now();
    if (now - lastViolationTimeRef.current < VIOLATION_COOLDOWN_MS) return;
    lastViolationTimeRef.current = now;

    const newCount = violationsRef.current + 1;

    setWarningMessage(`⚠️ Warning ${newCount}/3: ${reason}`);
    setShowWarning(true);
    clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => setShowWarning(false), 4500);

    setViolations(newCount);
    violationsRef.current = newCount;
    setViolationHistory(prev => [...prev, { reason, time: now }]);

    if (newCount >= 3) {
      examEndedRef.current = true;
      setTimeout(() => {
        alert(`❌ Exam Terminated!\n\nReason: Too many violations (3/3)\n\nLast violation: ${reason}`);
        triggerResult(true);
      }, 600);
    }
  }, []); // eslint-disable-line

  // ── Face-api detection loop ─────────────────────────────────────────────────
  const runFaceAPIDetection = useCallback(async () => {
    const faceapi = window.faceapi;
    const video = videoRef.current;
    if (!video || !faceapi || !cameraActiveRef.current) return;
    if (video.readyState < 2) return; // not enough data yet

    try {
      const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 });
      const detections = await faceapi
        .detectAllFaces(video, opts)
        .withFaceLandmarks();

      // Draw overlay
      const canvas = canvasRef.current;
      if (canvas && video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, detections);
        faceapi.draw.drawFaceLandmarks(canvas, detections);
      }

      if (detections.length === 0) {
        setFaceDetected(false);
        setMultipleFaces(false);
        setEyesOpen(false);
        setLookingAway(false);
        handleViolation("No face detected – position your face in front of the camera");
        return;
      }

      if (detections.length > 1) {
        setFaceDetected(true);
        setMultipleFaces(true);
        setLookingAway(false);
        handleViolation("Multiple faces detected – only you should be visible");
        return;
      }

      // Single face
      setFaceDetected(true);
      setMultipleFaces(false);

      const det = detections[0];
      const box = det.detection.box;
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 480;

      const cx = (box.x + box.width / 2) / vw;
      const cy = (box.y + box.height / 2) / vh;
      const sizeRatio = (box.width * box.height) / (vw * vh);

      const centered = cx > 0.2 && cx < 0.8 && cy > 0.1 && cy < 0.9;
      const properDist = sizeRatio > 0.04 && sizeRatio < 0.45;

      if (!centered || !properDist) {
        setLookingAway(true);
        handleViolation(!centered
          ? "Looking away – please face the camera directly"
          : "Adjust your distance from the camera");
      } else {
        setLookingAway(false);
      }

      // Eye openness check via landmarks
      if (det.landmarks) {
        const le = det.landmarks.getLeftEye();
        const re = det.landmarks.getRightEye();
        if (le.length >= 6 && re.length >= 6) {
          // EAR – Eye Aspect Ratio  (indices: 0=outer, 1/5=upper, 3=lower, 4=inner …)
          const eyeHeight = (p) => {
            const top = (p[1].y + p[2].y) / 2;
            const bot = (p[4].y + p[5].y) / 2;
            return Math.abs(bot - top);
          };
          const eyeWidth = (p) => Math.abs(p[0].x - p[3].x) || 1;
          const earL = eyeHeight(le) / eyeWidth(le);
          const earR = eyeHeight(re) / eyeWidth(re);
          const EAR_THRESH = 0.15;
          if (earL < EAR_THRESH && earR < EAR_THRESH) {
            setEyesOpen(false);
            handleViolation("Eyes appear closed – please keep your eyes open");
          } else {
            setEyesOpen(true);
          }
        }
      }
    } catch (err) {
      console.error("[face-api] detection error:", err);
    }
  }, [handleViolation]);

  // ── Motion-based fallback detection ────────────────────────────────────────
  const runMotionDetection = useCallback(() => {
    const video = videoRef.current;
    if (!video || !cameraActiveRef.current || video.readyState < 2) return;

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = 160; tmpCanvas.height = 120;
    const ctx = tmpCanvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 160, 120);
    const frame = ctx.getImageData(0, 0, 160, 120);

    if (lastImageDataRef.current) {
      let diff = 0;
      for (let i = 0; i < frame.data.length; i += 4) {
        diff += Math.abs(frame.data[i] - lastImageDataRef.current[i]);
      }
      const avgDiff = diff / (160 * 120);
      if (avgDiff < 8) {
        setFaceDetected(false);
        handleViolation("No face detected – ensure your face is visible");
      } else {
        setFaceDetected(true);
      }
    }
    lastImageDataRef.current = frame.data.slice();
  }, [handleViolation]);

  // ── Start detection interval ────────────────────────────────────────────────
  const startDetection = useCallback((useFaceAPI) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(
      useFaceAPI ? runFaceAPIDetection : runMotionDetection,
      DETECTION_INTERVAL_MS
    );
  }, [runFaceAPIDetection, runMotionDetection]);

  // ── Init: load models + camera ──────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // 1. Camera first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        const vid = videoRef.current;
        if (vid) {
          vid.srcObject = stream;
          await new Promise((res) => { vid.onloadedmetadata = res; });
          await vid.play();
          cameraActiveRef.current = true;
          setCameraActive(true);
        }
      } catch (err) {
        console.error("[camera]", err);
        setCameraActive(false);
        handleViolation("Camera access denied – please enable your camera");
      }

      // 2. Load face-api + models
      try {
        await loadScript(FACEAPI_CDN);
        if (!window.faceapi) throw new Error("faceapi not on window");

        const fa = window.faceapi;
        await fa.nets.tinyFaceDetector.loadFromUri(WEIGHTS_URL);
        await fa.nets.faceLandmark68Net.loadFromUri(WEIGHTS_URL);

        if (!mounted) return;
        modelReadyRef.current = true;
        setModelStatus("ready");
        startDetection(true);
      } catch (err) {
        console.warn("[face-api] failed, falling back to motion:", err.message);
        if (!mounted) return;
        modelReadyRef.current = false;
        setModelStatus("fallback");
        startDetection(false);
      }
    };

    init();

    // Fullscreen
    const goFullscreen = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    goFullscreen();

    const onFSChange = () => {
      if (!document.fullscreenElement) {
        handleViolation("Exited fullscreen – returning to fullscreen");
        goFullscreen();
      }
    };
    const onVisibility = () => {
      if (document.hidden) handleViolation("Tab switched – do not switch tabs during exam");
    };
    const onKey = (e) => {
      const blocked = ["Escape","F11"];
      if (blocked.includes(e.key) || (e.ctrlKey && ["w","r","t"].includes(e.key)) || (e.altKey && e.key === "Tab")) {
        e.preventDefault();
        handleViolation("Forbidden key combination detected");
      }
    };
    const onCtxMenu = (e) => { e.preventDefault(); handleViolation("Right-click detected"); };

    document.addEventListener("fullscreenchange", onFSChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("keydown", onKey);
    document.addEventListener("contextmenu", onCtxMenu);

    return () => {
      mounted = false;
      examEndedRef.current = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      clearInterval(intervalRef.current);
      clearTimeout(warningTimerRef.current);
      document.removeEventListener("fullscreenchange", onFSChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("contextmenu", onCtxMenu);
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    };
  }, []); // eslint-disable-line

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(t); setTimeout(() => triggerResult(true), 300); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  // ── Result ─────────────────────────────────────────────────────────────────
  const triggerResult = (auto = false) => {
    examEndedRef.current = true;
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (document.exitFullscreen) document.exitFullscreen().catch(() => {});

    const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
    let obtained = 0;
    const qResults = questions.map(q => {
      const ua = answers[q.id];
      const correct = ua === q.correctAnswer;
      if (correct) obtained += q.marks;
      return { ...q, userAnswer: ua ?? -1, isCorrect: correct, isAttempted: ua !== undefined };
    });
    const pct = ((obtained / totalMarks) * 100).toFixed(1);
    setResultData({
      totalMarks, obtainedMarks: obtained, percentage: pct,
      correctCount: qResults.filter(q => q.isCorrect).length,
      incorrectCount: qResults.filter(q => q.isAttempted && !q.isCorrect).length,
      unattemptedCount: qResults.filter(q => !q.isAttempted).length,
      qResults, violations: violationsRef.current, violationHistory,
      timeTaken: (exam?.duration ?? 120) * 60 - timeRemaining,
      submittedAt: new Date().toLocaleString(),
    });
    setShowResult(true);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.length;
  const notVisited = questions.length - answeredCount - markedCount;
  const currentQ = questions[currentQuestion];
  const timeColor = timeRemaining < 300 ? "text-red-600 bg-red-50" : timeRemaining < 600 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";

  // ── Submit Modal ────────────────────────────────────────────────────────────
  const SubmitModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-2xl max-w-sm w-full mx-4 p-6 shadow-2xl">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Submit Exam?</h3>
          <p className="text-sm text-gray-500 mt-1">{questions.length - answeredCount} questions unanswered</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Answered</span><span className="font-semibold text-emerald-600">{answeredCount}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Marked</span><span className="font-semibold text-amber-600">{markedCount}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Skipped</span><span className="font-semibold text-red-500">{questions.length - answeredCount}</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors">Cancel</button>
          <button onClick={() => { setShowSubmitConfirm(false); triggerResult(); }} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium transition-colors">Submit</button>
        </div>
      </div>
    </div>
  );

  // ── Result Modal ────────────────────────────────────────────────────────────
  const ResultModal = () => {
    if (!resultData) return null;
    const pct = parseFloat(resultData.percentage);
    const grade = pct >= 70 ? { label: "Passed ✓", color: "text-emerald-600", bg: "from-emerald-600 to-teal-600", light: "bg-emerald-50 border-emerald-200" }
      : pct >= 40 ? { label: "Average", color: "text-amber-600", bg: "from-amber-500 to-orange-500", light: "bg-amber-50 border-amber-200" }
      : { label: "Needs Work", color: "text-red-600", bg: "from-red-600 to-rose-600", light: "bg-red-50 border-red-200" };
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[80] p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className={`bg-gradient-to-r ${grade.bg} p-6 rounded-t-2xl text-white`}>
            <div className="flex justify-between items-center">
              <div><h2 className="text-2xl font-bold">Exam Complete</h2><p className="opacity-80 text-sm mt-1">{exam?.title}</p></div>
              <Award className="w-10 h-10 opacity-80" />
            </div>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full border-4 ${grade.light} mb-3`}>
                <div>
                  <div className={`text-3xl font-black ${grade.color}`}>{resultData.percentage}%</div>
                  <div className={`text-xs font-semibold ${grade.color}`}>{grade.label}</div>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-800">{resultData.obtainedMarks} / {resultData.totalMarks} marks</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Correct", val: resultData.correctCount, icon: CheckCircle, color: "emerald" },
                { label: "Incorrect", val: resultData.incorrectCount, icon: XCircle, color: "red" },
                { label: "Skipped", val: resultData.unattemptedCount, icon: AlertCircle, color: "gray" },
                { label: "Time", val: fmtTaken(resultData.timeTaken), icon: Clock, color: "blue" },
              ].map(({ label, val, icon: Icon, color }) => (
                <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 text-${color}-500`} />
                    <span className={`text-xs text-${color}-600 font-medium`}>{label}</span>
                  </div>
                  <p className={`text-2xl font-bold text-${color}-700`}>{val}</p>
                </div>
              ))}
            </div>

            {violationHistory.length > 0 && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-2">Violations ({resultData.violations}/3)</p>
                {violationHistory.map((v, i) => (
                  <p key={i} className="text-xs text-red-600">• {v.reason}</p>
                ))}
              </div>
            )}

            <div className="mb-5">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500" /> Question Analysis</h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {resultData.qResults.map((q, i) => (
                  <div key={q.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm text-gray-700 font-medium">Q{i+1}: {q.question.slice(0,48)}…</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ml-2 shrink-0 ${q.isCorrect ? "bg-emerald-100 text-emerald-700" : q.isAttempted ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                        {q.isCorrect ? "Correct" : q.isAttempted ? "Wrong" : "Skipped"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Your answer: {q.userAnswer !== -1 ? q.options[q.userAnswer] : "—"}</p>
                    {!q.isCorrect && q.isAttempted && (
                      <p className="text-xs text-emerald-600 mt-0.5">Correct: {q.options[q.correctAnswer]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const txt = `EXAM RESULT\n${exam?.title}\n${resultData.submittedAt}\n\nScore: ${resultData.obtainedMarks}/${resultData.totalMarks} (${resultData.percentage}%)\nCorrect: ${resultData.correctCount} | Wrong: ${resultData.incorrectCount} | Skipped: ${resultData.unattemptedCount}\nViolations: ${resultData.violations}/3\n\nQ&A:\n${resultData.qResults.map((q,i)=>`Q${i+1} [${q.isCorrect?"✓":"✗"}] ${q.question}`).join("\n")}`;
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(new Blob([txt]));
                  a.download = `result-${Date.now()}.txt`;
                  a.click();
                }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              ><Download className="w-4 h-4" /> Download</button>
              <button
                onClick={() => { setShowResult(false); onExamEnd(); }}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              ><Home className="w-4 h-4" /> Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex select-none">
      {/* Hidden video element */}
      <video ref={videoRef} autoPlay playsInline muted className="absolute w-0 h-0 overflow-hidden" />

      {/* Warning toast */}
      {showWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
          <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{warningMessage}</span>
          </div>
        </div>
      )}

      {showSubmitConfirm && <SubmitModal />}
      {showResult && <ResultModal />}

      {/* ── LEFT: Question area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 text-sm">{exam?.title}</h2>
              <p className="text-xs text-gray-400">Q{currentQuestion + 1} of {questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${timeColor}`}>
              {timeRemaining < 300 ? <Zap className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {fmt(timeRemaining)}
            </div>
            {/* Violation dots */}
            <div className="flex items-center gap-1.5">
              <Camera className={`w-4 h-4 ${cameraActive ? "text-emerald-500" : "text-red-500"}`} />
              {[1,2,3].map(i => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i <= violations ? "bg-red-500" : "bg-slate-200"}`} />
              ))}
              <span className={`text-xs font-semibold ml-1 ${violations >= 2 ? "text-red-600" : "text-slate-400"}`}>{violations}/3</span>
            </div>
          </div>
        </div>

        {/* Question card */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-lg">Q{currentQuestion + 1}</span>
                  <span className="text-xs text-slate-400">{currentQ.marks} marks</span>
                </div>
                <button
                  onClick={() => setMarkedForReview(prev => prev.includes(currentQ.id) ? prev.filter(id => id !== currentQ.id) : [...prev, currentQ.id])}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${markedForReview.includes(currentQ.id) ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {markedForReview.includes(currentQ.id) ? "Marked" : "Mark"}
                </button>
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-6">{currentQ.question}</h3>
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => {
                  const sel = answers[currentQ.id] === i;
                  return (
                    <div
                      key={i}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: i }))}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${sel ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${sel ? "border-blue-500" : "border-slate-300"}`}>
                        {sel && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                      </div>
                      <span className={`text-sm ${sel ? "font-medium text-blue-800" : "text-gray-700"}`}>{opt}</span>
                      {sel && <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Selected</span>}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-7 pt-5 border-t border-slate-100">
                <button
                  onClick={() => setCurrentQuestion(p => p - 1)}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 text-sm transition-colors"
                ><ChevronLeft className="w-4 h-4" /> Previous</button>
                <span className="text-xs text-slate-400 self-center">{currentQuestion + 1} / {questions.length}</span>
                <button
                  onClick={() => setCurrentQuestion(p => p + 1)}
                  disabled={currentQuestion === questions.length - 1}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 text-sm transition-colors"
                >Next <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Sidebar ──────────────────────────────────────────────── */}
      <div className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
        <div className="p-4 flex-1">
          {/* Live camera preview */}
          <div className="mb-4 rounded-xl overflow-hidden bg-slate-900 relative" style={{ aspectRatio: "4/3" }}>
            <video
              ref={videoRef}
              autoPlay playsInline muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}  // mirror
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: "scaleX(-1)" }}
            />
            {/* Status overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cameraActive ? "bg-red-500 animate-pulse" : "bg-gray-400"}`} />
              <span className="text-white text-xs font-medium drop-shadow">LIVE</span>
            </div>
            {/* Model status badge */}
            <div className="absolute bottom-2 right-2">
              {modelStatus === "loading" && (
                <span className="bg-black/60 text-amber-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Loader className="w-3 h-3 animate-spin" /> Loading AI…
                </span>
              )}
              {modelStatus === "ready" && (
                <span className="bg-black/60 text-emerald-400 text-xs px-2 py-0.5 rounded-full">AI Active</span>
              )}
              {(modelStatus === "fallback" || modelStatus === "error") && (
                <span className="bg-black/60 text-amber-400 text-xs px-2 py-0.5 rounded-full">Motion Mode</span>
              )}
            </div>
          </div>

          {/* Detection status */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 mb-4">
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" /> PROCTORING STATUS
            </p>
            <div className="space-y-2">
              {[
                { label: "Camera", ok: cameraActive, okText: "Active", failText: "Off" },
                { label: "Face", ok: faceDetected, okText: "Detected", failText: "Not found" },
                { label: "Eyes", ok: eyesOpen, okText: "Open", failText: "Closed" },
                { label: "Single person", ok: !multipleFaces, okText: "Yes", failText: "Multiple!" },
                { label: "Attention", ok: !lookingAway, okText: "Focused", failText: "Looking away" },
              ].map(({ label, ok, okText, failText }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className={`text-xs font-semibold ${ok ? "text-emerald-600" : "text-red-500 animate-pulse"}`}>
                    {ok ? `✓ ${okText}` : `✗ ${failText}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Violation warning */}
          {violations > 0 && (
            <div className={`rounded-xl p-3 mb-4 ${violations === 1 ? "bg-amber-50 border border-amber-200" : violations === 2 ? "bg-orange-50 border border-orange-200" : "bg-red-50 border border-red-200"}`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${violations === 1 ? "text-amber-500" : violations === 2 ? "text-orange-500" : "text-red-500"}`} />
                <div>
                  <p className={`text-xs font-semibold ${violations === 1 ? "text-amber-700" : violations === 2 ? "text-orange-700" : "text-red-700"}`}>
                    {violations === 1 ? "Warning 1 of 3" : violations === 2 ? "⚠ Final Warning!" : "Terminating…"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{3 - violations} strikes remaining</p>
                </div>
              </div>
            </div>
          )}

          {/* Question navigator */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> NAVIGATOR
            </p>
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {questions.map((q, i) => {
                let cls = "bg-slate-100 text-slate-600 hover:bg-slate-200";
                if (i === currentQuestion) cls = "bg-blue-600 text-white";
                else if (markedForReview.includes(q.id)) cls = "bg-amber-400 text-white";
                else if (answers[q.id] !== undefined) cls = "bg-emerald-500 text-white";
                return (
                  <button key={q.id} onClick={() => setCurrentQuestion(i)}
                    className={`${cls} rounded-lg py-2 text-xs font-bold transition-colors`}
                  >{i + 1}</button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
              {[["bg-emerald-500","Answered"], ["bg-amber-400","Marked"], ["bg-blue-600","Current"], ["bg-slate-200","Not visited"]].map(([bg, lbl]) => (
                <span key={lbl} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${bg}`}/>{lbl}</span>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Progress</span><span>{Math.round((answeredCount / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl py-2">
              <p className="font-bold text-emerald-700 text-lg">{answeredCount}</p>
              <p className="text-emerald-500">Done</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl py-2">
              <p className="font-bold text-amber-600 text-lg">{markedCount}</p>
              <p className="text-amber-500">Marked</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl py-2">
              <p className="font-bold text-slate-600 text-lg">{notVisited}</p>
              <p className="text-slate-400">Left</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => { if (answeredCount < questions.length) setShowSubmitConfirm(true); else triggerResult(); }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Submit Exam
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">{answeredCount}/{questions.length} answered</p>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;