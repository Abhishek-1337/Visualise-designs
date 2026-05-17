import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dealService } from '../../services';
import type { Deal } from '../../types';

interface FetchDealsParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export const fetchDeals = createAsyncThunk('deals/fetchAll', async (params?: FetchDealsParams) => {
  const response = await dealService.getAll(params);
  return response.data;
});

export const fetchPipeline = createAsyncThunk('deals/fetchPipeline', async () => {
  const response = await dealService.getPipeline();
  return response.data;
});

export const fetchDealStats = createAsyncThunk('deals/fetchStats', async () => {
  const response = await dealService.getStats();
  return response.data;
});

export const fetchDealById = createAsyncThunk('deals/fetchById', async (id: string) => {
  const response = await dealService.getById(id);
  return response.data;
});

export const createDeal = createAsyncThunk('deals/create', async (data: Partial<Deal>) => {
  const response = await dealService.create(data);
  return response.data;
});

export const updateDeal = createAsyncThunk('deals/update', async ({ id, data }: { id: string; data: Partial<Deal> }) => {
  const response = await dealService.update(id, data);
  return response.data;
});

export const updateDealStage = createAsyncThunk('deals/updateStage', async ({ id, data }: { id: string; data: any }) => {
  const response = await dealService.updateStage(id, data);
  return response.data;
});

export const deleteDeal = createAsyncThunk('deals/delete', async (id: string) => {
  await dealService.delete(id);
  return id;
});

const dealSlice = createSlice({
  name: 'deals',
  initialState: {
    deals: [] as Deal[],
    currentDeal: null as Deal | null,
    pipeline: [] as any[],
    stats: null as any,
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null as string | null,
  },
  reducers: {
    clearCurrentDeal: (state) => {
      state.currentDeal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deals = action.payload.deals;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPipeline.fulfilled, (state, action) => {
        state.pipeline = action.payload.pipeline;
      })
      .addCase(fetchDealStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchDealById.fulfilled, (state, action) => {
        state.currentDeal = action.payload;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.deals.unshift(action.payload);
      })
      .addCase(updateDeal.fulfilled, (state, action) => {
        const index = state.deals.findIndex(d => d.id === action.payload.id);
        if (index !== -1) state.deals[index] = action.payload;
      })
      .addCase(updateDealStage.fulfilled, (state, action) => {
        const index = state.deals.findIndex(d => d.id === action.payload.id);
        if (index !== -1) state.deals[index] = action.payload;
      })
      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.deals = state.deals.filter(d => d.id !== action.payload);
      });
  },
});

export const { clearCurrentDeal } = dealSlice.actions;
export default dealSlice.reducer;
