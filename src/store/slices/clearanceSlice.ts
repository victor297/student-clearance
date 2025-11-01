import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = " http://localhost:5000/api";

interface ClearanceRequest {
  _id: string;
  student_id: any;
  departments: {
    [key: string]: {
      status: "pending" | "approved" | "rejected";
      officer_id?: string;
      comments?: string;
      timestamp?: string;
    };
  };
  overall_status: "pending" | "approved" | "rejected";
  current_stage: string;
  submitted_at: string;
  completed_at?: string;
  reason?: string;
}

interface ClearanceState {
  requests: ClearanceRequest[];
  myRequests: ClearanceRequest[];
  pendingRequests: ClearanceRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: ClearanceState = {
  requests: [],
  myRequests: [],
  pendingRequests: [],
  loading: false,
  error: null,
};

// Async thunks
export const createClearanceRequest = createAsyncThunk(
  "clearance/createRequest",
  async (requestData: { reason: string }, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.post(
      `${API_URL}/clearance/request`,
      requestData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);

export const getMyRequests = createAsyncThunk(
  "clearance/getMyRequests",
  async (_, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.get(`${API_URL}/clearance/my-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const getPendingRequests = createAsyncThunk(
  "clearance/getPendingRequests",
  async (_, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.get(`${API_URL}/clearance/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const updateRequestStatus = createAsyncThunk(
  "clearance/updateStatus",
  async (
    {
      requestId,
      status,
      comments,
    }: { requestId: string; status: string; comments?: string },
    { getState }
  ) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.patch(
      `${API_URL}/clearance/${requestId}/status`,
      { status, comments },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);

export const getAllRequests = createAsyncThunk(
  "clearance/getAllRequests",
  async (
    { status, department }: { status?: string; department?: string } = {},
    { getState }
  ) => {
    const state = getState() as any;
    const token = state.auth.token;

    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (department) params.append("department", department);

    const response = await axios.get(
      `${API_URL}/clearance/all?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);

const clearanceSlice = createSlice({
  name: "clearance",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create request
      .addCase(createClearanceRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClearanceRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createClearanceRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create request";
      })
      // Get my requests
      .addCase(getMyRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getMyRequests.fulfilled,
        (state, action: PayloadAction<ClearanceRequest[]>) => {
          state.loading = false;
          state.myRequests = action.payload;
        }
      )
      .addCase(getMyRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch requests";
      })
      // Get pending requests
      .addCase(getPendingRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getPendingRequests.fulfilled,
        (state, action: PayloadAction<ClearanceRequest[]>) => {
          state.loading = false;
          state.pendingRequests = action.payload;
        }
      )
      .addCase(getPendingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch pending requests";
      })
      // Update status
      .addCase(updateRequestStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateRequestStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update status";
      })
      // Get all requests
      .addCase(
        getAllRequests.fulfilled,
        (state, action: PayloadAction<ClearanceRequest[]>) => {
          state.loading = false;
          state.requests = action.payload;
        }
      );
  },
});

export const { clearError } = clearanceSlice.actions;
export default clearanceSlice.reducer;
