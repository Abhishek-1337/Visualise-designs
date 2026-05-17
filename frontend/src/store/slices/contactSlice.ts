import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contactService } from '../../services';
import type { Contact } from '../../types';

interface FetchContactsParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any;
}

export const fetchContacts = createAsyncThunk('contacts/fetchAll', async (params?: FetchContactsParams) => {
  const response = await contactService.getAll(params);
  return response.data;
});

export const fetchContactStats = createAsyncThunk('contacts/fetchStats', async () => {
  const response = await contactService.getStats();
  return response.data;
});

export const fetchContactById = createAsyncThunk('contacts/fetchById', async (id: string) => {
  const response = await contactService.getById(id);
  return response.data;
});

export const createContact = createAsyncThunk('contacts/create', async (data: Partial<Contact>, { rejectWithValue }) => {
  try {
    const response = await contactService.create(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error);
  }
});

export const updateContact = createAsyncThunk('contacts/update', async ({ id, data }: { id: string; data: Partial<Contact> }) => {
  const response = await contactService.update(id, data);
  return response.data;
});

export const deleteContact = createAsyncThunk('contacts/delete', async (id: string) => {
  await contactService.delete(id);
  return id;
});

const contactSlice = createSlice({
  name: 'contacts',
  initialState: {
    contacts: [] as Contact[],
    currentContact: null as Contact | null,
    stats: null as any,
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    isLoading: false,
    error: null as string | null,
  },
  reducers: {
    clearCurrentContact: (state) => {
      state.currentContact = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => { state.isLoading = true; })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = action.payload.contacts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchContactStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchContactById.fulfilled, (state, action) => {
        state.currentContact = action.payload;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.contacts.unshift(action.payload);
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        const index = state.contacts.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state.contacts[index] = action.payload;
        if (state.currentContact?.id === action.payload.id) {
          state.currentContact = action.payload;
        }
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter(c => c.id !== action.payload);
      });
  },
});

export const { clearCurrentContact } = contactSlice.actions;
export default contactSlice.reducer;
