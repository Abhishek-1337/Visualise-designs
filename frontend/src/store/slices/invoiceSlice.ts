import { createSlice } from '@reduxjs/toolkit';
import { fetchInvoices, fetchInvoiceStats } from './projectSlice';

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoices: [],
    stats: null,
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => { state.isLoading = true; })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload.invoices;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchInvoiceStats.fulfilled, (state, action) => { state.stats = action.payload; });
  },
});

export default invoiceSlice.reducer;
