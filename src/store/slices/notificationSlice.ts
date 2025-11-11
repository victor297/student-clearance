import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = " https://student-clearance-one.vercel.app/api";

interface Notification {
  _id: string;
  message: string;
  type: "clearance_status" | "new_request" | "approval_required";
  status: "unread" | "read";
  createdAt: string;
  related_request?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async thunks
export const getNotifications = createAsyncThunk(
  "notifications/getNotifications",
  async (_, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notificationId: string, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.patch(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    await axios.patch(
      `${API_URL}/notifications/read-all`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return;
  }
);

export const getUnreadCount = createAsyncThunk(
  "notifications/getUnreadCount",
  async (_, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;

    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getNotifications.fulfilled,
        (state, action: PayloadAction<Notification[]>) => {
          state.loading = false;
          state.notifications = action.payload;
        }
      )
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notifications";
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const updatedNotification = action.payload.notification;
        const index = state.notifications.findIndex(
          (n) => n._id === updatedNotification._id
        );
        if (index !== -1) {
          state.notifications[index] = updatedNotification;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((notification) => {
          notification.status = "read";
        });
        state.unreadCount = 0;
      })
      // Get unread count
      .addCase(
        getUnreadCount.fulfilled,
        (state, action: PayloadAction<{ count: number }>) => {
          state.unreadCount = action.payload.count;
        }
      );
  },
});

export const { clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
