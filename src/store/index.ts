import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import clearanceSlice from './slices/clearanceSlice';
import userSlice from './slices/userSlice';
import notificationSlice from './slices/notificationSlice';
import departmentSlice from './slices/departmentSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    clearance: clearanceSlice,
    user: userSlice,
    notifications: notificationSlice,
    departments: departmentSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;