import { createSlice } from '@reduxjs/toolkit';
import { fetchCommunications, createCommunication } from './projectSlice';

const communicationSlice = createSlice({
  name: 'communications',
  initialState: {
    communications: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunications.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCommunications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communications = action.payload.communications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCommunications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createCommunication.fulfilled, (state, action) => {
        state.communications.unshift(action.payload);
      });
  },
});

export default communicationSlice.reducer;
