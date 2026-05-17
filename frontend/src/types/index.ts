export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CLIENT';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: Role;
  phone?: string;
  company?: string;
  isActive?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Contact {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  avatar?: string;
}

export interface Deal {
  id?: string;
  title?: string;
  value?: number;
  status?: string;
  stage?: string;
  contactId?: string;
  probability?: number;
  expectedCloseDate?: string;
}

export interface Project {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  progress?: number;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  team?: any[];
}

export interface Task {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId?: string;
  assigneeId?: string;
}

export interface DashboardState {
  todaysTasks: any[];
  moneySnapshot: {
    revenue: number;
    pending: number;
    overdue: number;
  };
  quickAccess: any[];
  isLoading: boolean;
}

export interface ContactState {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface DealState {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CommunicationState {
  messages: any[];
  isLoading: boolean;
  error: string | null;
}

export interface InvoiceState {
  invoices: any[];
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  contacts: ContactState;
  deals: DealState;
  projects: ProjectState;
  tasks: TaskState;
  communications: CommunicationState;
  invoices: InvoiceState;
  dashboard: DashboardState;
}
