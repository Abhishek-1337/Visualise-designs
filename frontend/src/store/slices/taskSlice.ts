import { createSlice } from '@reduxjs/toolkit';
import { fetchTasks, fetchTaskStats, createTask, updateTaskStatus } from './projectSlice';

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    stats: null,
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => { state.stats = action.payload; })
      .addCase(createTask.fulfilled, (state, action) => { state.tasks.unshift(action.payload); })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.tasks[index] = action.payload;
      });
  },
});

export default taskSlice.reducer;
