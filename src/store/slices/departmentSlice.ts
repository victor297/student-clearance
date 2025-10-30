import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://student-clearance-i1lk.onrender.com/api";

interface Department {
  _id: string;
  dept_name: string;
  description?: string;
  officers: any[];
  is_active: boolean;
}

interface DepartmentState {
  departments: Department[];
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
};

// Async thunks
export const getDepartments = createAsyncThunk(
  "departments/getDepartments",
  async (_, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.get(`${API_URL}/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const createDepartment = createAsyncThunk(
  "departments/createDepartment",
  async (
    { dept_name, description }: { dept_name: string; description?: string },
    { getState }
  ) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.post(
      `${API_URL}/departments`,
      { dept_name, description },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);

export const addOfficerToDepartment = createAsyncThunk(
  "departments/addOfficer",
  async (
    { departmentId, officerId }: { departmentId: string; officerId: string },
    { getState }
  ) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.post(
      `${API_URL}/departments/${departmentId}/officers`,
      { officer_id: officerId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);

export const removeOfficerFromDepartment = createAsyncThunk(
  "departments/removeOfficer",
  async (
    { departmentId, officerId }: { departmentId: string; officerId: string },
    { getState }
  ) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.delete(
      `${API_URL}/departments/${departmentId}/officers/${officerId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get departments
      .addCase(getDepartments.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getDepartments.fulfilled,
        (state, action: PayloadAction<Department[]>) => {
          state.loading = false;
          state.departments = action.payload;
        }
      )
      .addCase(getDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch departments";
      })
      // Create department
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.departments.push(action.payload.department);
      })
      // Add officer
      .addCase(addOfficerToDepartment.fulfilled, (state, action) => {
        const updatedDept = action.payload.department;
        const index = state.departments.findIndex(
          (dept) => dept._id === updatedDept._id
        );
        if (index !== -1) {
          state.departments[index] = updatedDept;
        }
      })
      // Remove officer
      .addCase(removeOfficerFromDepartment.fulfilled, (state, action) => {
        const updatedDept = action.payload.department;
        const index = state.departments.findIndex(
          (dept) => dept._id === updatedDept._id
        );
        if (index !== -1) {
          state.departments[index] = updatedDept;
        }
      });
  },
});

export const { clearError } = departmentSlice.actions;
export default departmentSlice.reducer;
