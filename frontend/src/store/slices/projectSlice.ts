import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectService, taskService, communicationService, invoiceService, dashboardService, fileService } from '../../services';
import type { Project, Task } from '../../types';

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params?: FetchParams) => {
  const response = await projectService.getAll(params);
  return response.data;
});

export const fetchProjectStats = createAsyncThunk('projects/fetchStats', async () => {
  const response = await projectService.getStats();
  return response.data;
});

export const fetchProjectById = createAsyncThunk('projects/fetchById', async (id: string) => {
  const response = await projectService.getById(id);
  return response.data;
});

export const createProject = createAsyncThunk('projects/create', async (data: Partial<Project>) => {
  const response = await projectService.create(data);
  return response.data;
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }: { id: string; data: Partial<Project> }) => {
  const response = await projectService.update(id, data);
  return response.data;
});

export const deleteProject = createAsyncThunk('projects/delete', async (id: string) => {
  await projectService.delete(id);
  return id;
});

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (params?: FetchParams) => {
  const response = await taskService.getAll(params);
  return response.data;
});

export const fetchTaskStats = createAsyncThunk('tasks/fetchStats', async () => {
  const response = await taskService.getStats();
  return response.data;
});

export const createTask = createAsyncThunk('tasks/create', async (data: Partial<Task>) => {
  const response = await taskService.create(data);
  return response.data;
});

export const updateTaskStatus = createAsyncThunk('tasks/updateStatus', async ({ id, data }: { id: string; data: any }) => {
  const response = await taskService.updateStatus(id, data);
  return response.data;
});

export const fetchCommunications = createAsyncThunk('communications/fetchAll', async (params?: FetchParams) => {
  const response = await communicationService.getAll(params);
  return response.data;
});

export const createCommunication = createAsyncThunk('communications/create', async (data: any) => {
  const response = await communicationService.create(data);
  return response.data;
});

export const fetchInvoices = createAsyncThunk('invoices/fetchAll', async (params?: FetchParams) => {
  const response = await invoiceService.getAll(params);
  return response.data;
});

export const fetchInvoiceStats = createAsyncThunk('invoices/fetchStats', async () => {
  const response = await invoiceService.getStats();
  return response.data;
});

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async () => {
  const response = await dashboardService.getDashboard();
  return response.data;
});

export const fetchFinancial = createAsyncThunk('dashboard/fetchFinancial', async () => {
  const response = await dashboardService.getFinancial();
  return response.data;
});

export const fetchActivities = createAsyncThunk('activities/fetchRecent', async () => {
  const response = await dashboardService.getRecentActivity();
  return response.data;
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [] as Project[],
    currentProject: null as Project | null,
    stats: null as any,
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.projects;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProjectStats.fulfilled, (state, action) => { state.stats = action.payload; })
      .addCase(fetchProjectById.fulfilled, (state, action) => { state.currentProject = action.payload; })
      .addCase(createProject.fulfilled, (state, action) => { state.projects.unshift(action.payload); })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.projects[index] = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
      });
  },
});

export default projectSlice.reducer;
