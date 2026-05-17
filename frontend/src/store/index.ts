import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import contactReducer from './slices/contactSlice';
import dealReducer from './slices/dealSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import communicationReducer from './slices/communicationSlice';
import invoiceReducer from './slices/invoiceSlice';
import dashboardReducer from './slices/dashboardSlice';
import themeReducer from './slices/themeSlice';

export type { User, AuthState, Contact, Deal, Project, Task, DashboardState, ContactState, DealState, ProjectState, TaskState, CommunicationState, InvoiceState } from '../types';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactReducer,
    deals: dealReducer,
    projects: projectReducer,
    tasks: taskReducer,
    communications: communicationReducer,
    invoices: invoiceReducer,
    dashboard: dashboardReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
