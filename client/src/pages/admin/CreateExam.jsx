import React, { useState } from "react";

const CreateExam = () => {
  const [step, setStep] = useState(1);
  const [examData, setExamData] = useState({
    subject: "",
    duration: "",
    startTime: "",
    endTime: "",
  });

  const [questions, setQuestions] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const handleExamInfoChange = (e) => {
    const { name, value } = e.target;
    setExamData((prev) => ({ ...prev, [name]: value }));
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const removeQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id, field, value, optionIndex) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          if (field === "text") {
            return { ...q, text: value };
          } else if (field === "option") {
            const newOptions = [...q.options];
            newOptions[optionIndex] = value;
            return { ...q, options: newOptions };
          } else if (field === "correctAnswer") {
            return { ...q, correctAnswer: parseInt(value) };
          }
        }
        return q;
      })
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (examData.subject && examData.duration && examData.startTime && examData.endTime) {
        setStep(2);
      } else {
        alert("Please fill all exam details");
      }
    }
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    if (questions.length < 20) {
      alert(`Please add at least 20 questions. Current: ${questions.length}`);
      return;
    }

    // Validate all questions are filled
    const isValid = questions.every(
      (q) =>
        q.text.trim() !== "" &&
        q.options.every((opt) => opt.trim() !== "") &&
        q.correctAnswer !== undefined
    );

    if (!isValid) {
      alert("Please fill all question fields and select correct answers");
      return;
    }

    setSuccessMessage("Exam created successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);

    // Reset form
    setExamData({
      subject: "",
      duration: "",
      startTime: "",
      endTime: "",
    });
    setQuestions([]);
    setStep(1);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Create Exam</h1>

      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="step-indicator">
        <div className={`step ${step >= 1 ? "active" : ""}`}>1. Exam Details</div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>2. Add Questions</div>
      </div>

      {step === 1 && (
        <div className="form-container">
          <div className="form-group">
            <label>Subject Name</label>
            <input
              type="text"
              name="subject"
              value={examData.subject}
              onChange={handleExamInfoChange}
              placeholder="Enter subject name"
            />
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={examData.duration}
              onChange={handleExamInfoChange}
              placeholder="Enter duration in minutes"
            />
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <input
              type="datetime-local"
              name="startTime"
              value={examData.startTime}
              onChange={handleExamInfoChange}
            />
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input
              type="datetime-local"
              name="endTime"
              value={examData.endTime}
              onChange={handleExamInfoChange}
            />
          </div>

          <button onClick={handleNextStep} className="btn-primary">
            Next: Add Questions
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="questions-container">
          <div className="questions-header">
            <h3>Questions ({questions.length}/20 minimum)</h3>
            <button onClick={addQuestion} className="btn-secondary">
              + Add Question
            </button>
          </div>

          {questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <h4>Question {index + 1}</h4>
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(question.id)} className="btn-icon delete">
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text</label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                  placeholder="Enter question"
                />
              </div>

              <div className="options-grid">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="option-item">
                    <label>Option {optIndex + 1}</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        updateQuestion(question.id, "option", e.target.value, optIndex)
                      }
                      placeholder={`Option ${optIndex + 1}`}
                    />
                    <input
                      type="radio"
                      name={`correct-${question.id}`}
                      value={optIndex}
                      checked={question.correctAnswer === optIndex}
                      onChange={(e) =>
                        updateQuestion(question.id, "correctAnswer", e.target.value)
                      }
                    />
                    <span>Correct</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="questions-actions">
            <button onClick={handlePreviousStep} className="btn-secondary">
              Previous
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              Create Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExam;