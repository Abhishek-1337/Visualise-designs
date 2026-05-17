import { createSlice } from '@reduxjs/toolkit';
import { fetchDashboard, fetchFinancial, fetchActivities } from './projectSlice';

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    todaysTasks: [],
    taskStats: [],
    dealStats: null,
    invoiceStats: null,
    financial: null,
    activities: [],
    contactCount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todaysTasks = action.payload.todaysTasks;
        state.taskStats = action.payload.taskStats;
        state.dealStats = action.payload.dealStats;
        state.invoiceStats = action.payload.invoiceStats;
        state.activities = action.payload.recentActivities;
        state.contactCount = action.payload.contactCount;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFinancial.fulfilled, (state, action) => {
        state.financial = action.payload;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activities = action.payload.activities;
      });
  },
});

export default dashboardSlice.reducer;
