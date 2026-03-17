// store/slices/examSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// Admin — fetch all exams in their department
export const fetchExams = createAsyncThunk(
  "exams/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/admin/exams");
      return res.data.exams;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch exams");
    }
  }
);

// Admin — fetch single exam (for EditExam page)
export const fetchExamById = createAsyncThunk(
  "exams/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/admin/exams/${id}`);
      return res.data.exam;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch exam");
    }
  }
);

// Admin — create exam
export const createExam = createAsyncThunk(
  "exams/create",
  async (body, { rejectWithValue }) => {
    try {
      const res = await API.post("/admin/exams", body);
      return res.data.exam;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create exam");
    }
  }
);

// Admin — update exam
export const updateExam = createAsyncThunk(
  "exams/update",
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/admin/exams/${id}`, body);
      return res.data.exam;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update exam");
    }
  }
);

// Admin — delete exam
export const deleteExam = createAsyncThunk(
  "exams/delete",
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/admin/exams/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete exam");
    }
  }
);

// Student — fetch exams for their department (no correctAnswer)
export const fetchStudentExams = createAsyncThunk(
  "exams/fetchStudent",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/student/exams");
      return res.data.exams;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch exams");
    }
  }
);

// Student — fetch single exam to attempt (enforces time window)
export const fetchStudentExamById = createAsyncThunk(
  "exams/fetchStudentById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/student/exams/${id}`);
      return res.data.exam;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch exam");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const examSlice = createSlice({
  name: "exams",
  initialState: {
    // Admin
    list:         [],      // all exams for admin's dept
    selected:     null,    // single exam loaded for edit

    // Student
    studentList:  [],      // exams for student's dept (no correctAnswer)
    activeExam:   null,    // exam currently being attempted

    // State
    loading:      false,
    actionLoading:false,   // for create/update/delete spinners
    error:        null,    // fetch error
    actionError:  null,    // create/update/delete error
  },
  reducers: {
    clearSelected:    (state) => { state.selected    = null; },
    clearActiveExam:  (state) => { state.activeExam  = null; },
    clearActionError: (state) => { state.actionError = null; },
    clearError:       (state) => { state.error       = null; },
  },
  extraReducers: (builder) => {

    // ── fetchExams (admin list) ───────────────────────────────────────────────
    builder
      .addCase(fetchExams.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = action.payload;
      })
      .addCase(fetchExams.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── fetchExamById (admin edit) ────────────────────────────────────────────
    builder
      .addCase(fetchExamById.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchExamById.fulfilled, (state, action) => {
        state.loading  = false;
        state.selected = action.payload;
      })
      .addCase(fetchExamById.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── createExam ────────────────────────────────────────────────────────────
    builder
      .addCase(createExam.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(createExam.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list.unshift(action.payload);   // add to top of list
      })
      .addCase(createExam.rejected,  (state, action) => {
        state.actionLoading = false;
        state.actionError   = action.payload;
      });

    // ── updateExam ────────────────────────────────────────────────────────────
    builder
      .addCase(updateExam.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(updateExam.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Update in admin list
        const idx = state.list.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
        // Update selected if it's the same exam
        if (state.selected?._id === action.payload._id) {
          state.selected = { ...state.selected, ...action.payload };
        }
      })
      .addCase(updateExam.rejected,  (state, action) => {
        state.actionLoading = false;
        state.actionError   = action.payload;
      });

    // ── deleteExam ────────────────────────────────────────────────────────────
    builder
      .addCase(deleteExam.pending,   (state) => { state.actionLoading = true;  state.actionError = null; })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list          = state.list.filter(e => e._id !== action.payload);
      })
      .addCase(deleteExam.rejected,  (state, action) => {
        state.actionLoading = false;
        state.actionError   = action.payload;
      });

    // ── fetchStudentExams ─────────────────────────────────────────────────────
    builder
      .addCase(fetchStudentExams.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchStudentExams.fulfilled, (state, action) => {
        state.loading     = false;
        state.studentList = action.payload;
      })
      .addCase(fetchStudentExams.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── fetchStudentExamById ──────────────────────────────────────────────────
    builder
      .addCase(fetchStudentExamById.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchStudentExamById.fulfilled, (state, action) => {
        state.loading    = false;
        state.activeExam = action.payload;
      })
      .addCase(fetchStudentExamById.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const {
  clearSelected,
  clearActiveExam,
  clearActionError,
  clearError,
} = examSlice.actions;

export default examSlice.reducer;