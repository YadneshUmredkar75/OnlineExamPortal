import React, { useState, useRef, useEffect } from "react";

const CreateExam = () => {
  const [step, setStep] = useState(1);
  const [examData, setExamData] = useState({
    subject: "",
    duration: "",
    startTime: "",
    endTime: "",
  });

  const [questions, setQuestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const questionRefs = useRef([]);

  // ── Handle exam basic info change ────────────────────────────────
  const handleExamInfoChange = (e) => {
    const { name, value } = e.target;
    setExamData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ── Add ONE new empty question ───────────────────────────────────
  const addQuestion = () => {
    const newQ = {
      id: Date.now() + Math.random(),
      text: "",
      options: ["", "", "", ""],
      correctAnswer: null,
    };

    setQuestions((prev) => [...prev, newQ]);

    setTimeout(() => {
      const newIndex = questions.length;
      if (questionRefs.current[newIndex]) {
        questionRefs.current[newIndex].focus();
      }
    }, 100);
  };

  // ── Add TEN new empty questions at once ──────────────────────────
  const addTenQuestions = () => {
    const newQuestions = [];
    const now = Date.now();

    for (let i = 0; i < 10; i++) {
      newQuestions.push({
        id: now + Math.random() + i,
        text: "",
        options: ["", "", "", ""],
        correctAnswer: null,
      });
    }

    setQuestions((prev) => [...prev, ...newQuestions]);

    // Optional: focus the first of the new batch
    setTimeout(() => {
      const firstNewIndex = questions.length;
      if (questionRefs.current[firstNewIndex]) {
        questionRefs.current[firstNewIndex].focus();
      }
    }, 100);
  };

  // ── Remove question ──────────────────────────────────────────────
  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // ── Update question field ────────────────────────────────────────
  const updateQuestion = (id, field, value, optionIndex = null) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;

        if (field === "text") return { ...q, text: value };
        if (field === "option") {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        if (field === "correctAnswer") {
          return { ...q, correctAnswer: parseInt(value, 10) };
        }

        return q;
      })
    );

    if (errors[`q-${id}-${field}`]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[`q-${id}-${field}`];
        return updated;
      });
    }
  };

  // ── Validate exam basic info ─────────────────────────────────────
  const validateExamInfo = () => {
    const newErrors = {};

    if (!examData.subject.trim()) newErrors.subject = "Subject name is required";
    if (!examData.duration || Number(examData.duration) <= 0)
      newErrors.duration = "Enter a valid duration in minutes";
    if (!examData.startTime) newErrors.startTime = "Start time is required";
    if (!examData.endTime) newErrors.endTime = "End time is required";

    if (examData.startTime && examData.endTime) {
      const start = new Date(examData.startTime);
      const end = new Date(examData.endTime);
      if (end <= start) newErrors.endTime = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateExamInfo()) {
      setStep(2);
    }
  };

  // ── Validate all questions ───────────────────────────────────────
  const validateQuestions = () => {
    const newErrors = {};

    questions.forEach((q) => {
      if (!q.text.trim()) {
        newErrors[`q-${q.id}-text`] = "Question text is required";
      }

      q.options.forEach((opt, idx) => {
        if (!opt.trim()) {
          newErrors[`q-${q.id}-opt${idx}`] = `Option ${idx + 1} cannot be empty`;
        }
      });

      if (q.correctAnswer === null) {
        newErrors[`q-${q.id}-correct`] = "Please select the correct answer";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Final submit ─────────────────────────────────────────────────
  const handleSubmit = () => {
    if (questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }

    if (!validateQuestions()) {
      alert("Please correct the errors shown in the questions.");
      return;
    }

    const exam = {
      ...examData,
      questions: questions.map((q) => ({
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
    };

    console.log("Exam Created:", exam);

    setSuccessMessage(`Exam "${examData.subject}" created successfully!`);
    setTimeout(() => setSuccessMessage(""), 5000);

    // Reset
    setExamData({ subject: "", duration: "", startTime: "", endTime: "" });
    setQuestions([]);
    setStep(1);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold">Create New Exam</h1>
          <p className="mt-3 text-indigo-100">
            Fill exam details and add as many questions as you want
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-5 mx-8 mt-6 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Step Progress */}
        <div className="flex border-b px-8 pt-6 bg-gray-50">
          <div
            className={`pb-5 px-8 font-semibold cursor-pointer transition-colors ${
              step === 1
                ? "border-b-4 border-indigo-600 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            1. Exam Information
          </div>
          <div
            className={`pb-5 px-8 font-semibold cursor-pointer transition-colors ${
              step === 2
                ? "border-b-4 border-indigo-600 text-indigo-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            2. Questions ({questions.length})
          </div>
        </div>

        {/* STEP 1: Exam Details */}
        {step === 1 && (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject / Paper Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={examData.subject}
                  onChange={handleExamInfoChange}
                  placeholder="e.g. Data Structures and Algorithms"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.subject ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={examData.duration}
                  onChange={handleExamInfoChange}
                  placeholder="120"
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.duration && <p className="text-red-600 text-sm mt-1">{errors.duration}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={examData.startTime}
                  onChange={handleExamInfoChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.startTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.startTime && <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={examData.endTime}
                  onChange={handleExamInfoChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.endTime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.endTime && <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>}
              </div>
            </div>

            <div className="flex justify-end mt-10">
              <button
                onClick={handleNextStep}
                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                Next: Add Questions →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Questions */}
        {step === 2 && (
          <div className="p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Questions <span className="text-gray-500 font-normal">({questions.length})</span>
                </h2>
                <p className="text-gray-600 mt-1">
                  Add questions one by one or in batches of 10.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={addQuestion}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
                >
                  <span>+1</span> Add Question
                </button>

                <button
                  onClick={addTenQuestions}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md"
                >
                  <span>+10</span> Add 10 Questions
                </button>
              </div>
            </div>

            {questions.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <p className="text-xl text-gray-600 mb-4">No questions added yet</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={addQuestion}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    + Add First Question
                  </button>
                  <button
                    onClick={addTenQuestions}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    + Add 10 Questions
                  </button>
                </div>
              </div>
            )}

            {questions.map((q, index) => (
              <div
                key={q.id}
                className="mb-10 p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Question {index + 1}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="text-red-600 hover:text-red-800 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    ref={(el) => (questionRefs.current[index] = el)}
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                    placeholder="Type your question here..."
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors[`q-${q.id}-text`] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors[`q-${q.id}-text`] && (
                    <p className="text-red-600 text-sm mt-1">{errors[`q-${q.id}-text`]}</p>
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Option {optIndex + 1}
                        </label>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) =>
                            updateQuestion(q.id, "option", e.target.value, optIndex)
                          }
                          placeholder={`Enter option ${optIndex + 1}`}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors[`q-${q.id}-opt${optIndex}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[`q-${q.id}-opt${optIndex}`] && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors[`q-${q.id}-opt${optIndex}`]}
                          </p>
                        )}
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer pt-6">
                        <input
                          type="radio"
                          name={`correct-answer-${q.id}`}
                          value={optIndex}
                          checked={q.correctAnswer === optIndex}
                          onChange={(e) =>
                            updateQuestion(q.id, "correctAnswer", e.target.value)
                          }
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Correct</span>
                      </label>
                    </div>
                  ))}
                </div>

                {errors[`q-${q.id}-correct`] && (
                  <p className="text-red-600 text-sm mt-2 bg-red-50 p-3 rounded-lg">
                    {errors[`q-${q.id}-correct`]}
                  </p>
                )}
              </div>
            ))}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-12">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 px-8 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                ← Back to Exam Details
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 py-4 px-8 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Create Exam
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateExam;