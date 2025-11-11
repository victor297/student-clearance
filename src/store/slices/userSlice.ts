import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = " https://student-clearance-one.vercel.app/api";

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  department: string;
  officer_department?: string;
  is_eligible: boolean;
  student_id?: string;
  cgpa?: number;
}

interface UserState {
  users: User[];
  officers: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  officers: [],
  loading: false,
  error: null,
};

// Async thunks
export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (
    { role, department }: { role?: string; department?: string } = {},
    { getState }
  ) => {
    const state = getState() as any;
    const token = state.auth.token;

    const params = new URLSearchParams();
    if (role) params.append("role", role);
    if (department) params.append("department", department);

    const response = await axios.get(`${API_URL}/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const getOfficersByDepartment = createAsyncThunk(
  "user/getOfficersByDepartment",
  async (department: string, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.get(
      `${API_URL}/users/officers/${department}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);

export const updateUserEligibility = createAsyncThunk(
  "user/updateEligibility",
  async (
    { userId, is_eligible }: { userId: string; is_eligible: boolean },
    { getState }
  ) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.patch(
      `${API_URL}/users/${userId}/eligibility`,
      { is_eligible },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);

export const updateUserRole = createAsyncThunk(
  "user/updateRole",
  async (
    {
      userId,
      role,
      officer_department,
    }: { userId: string; role: string; officer_department?: string },
    { getState }
  ) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.patch(
      `${API_URL}/users/${userId}/role`,
      { role, officer_department },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId: string, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    await axios.delete(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return userId;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllUsers.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.loading = false;
          state.users = action.payload;
        }
      )
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch users";
      })
      // Get officers by department
      .addCase(
        getOfficersByDepartment.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.officers = action.payload;
        }
      )
      // Update eligibility
      .addCase(updateUserEligibility.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(
          (user) => user._id === updatedUser._id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      // Update role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(
          (user) => user._id === updatedUser._id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
