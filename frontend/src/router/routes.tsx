import { ROLES } from '../utils/constants';

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  roles?: string[];
  redirect?: string;
}

export const publicRoutes: RouteConfig[] = [
  { 
    path: '/login', 
    component: () => import('../pages/Auth/LoginPage').then(m => m.default) 
  },
  { 
    path: '/register', 
    component: () => import('../pages/Auth/RegisterPage').then(m => m.default) 
  },
];

export const privateRoutes: RouteConfig[] = [
  { path: '/', redirect: '/dashboard' },
  { 
    path: '/dashboard', 
    component: () => import('../pages/Dashboard/DashboardPage').then(m => m.default) 
  },
  { 
    path: '/cases', 
    component: () => import('../pages/Cases/CasesPage').then(m => m.default) 
  },
  { 
    path: '/clients', 
    component: () => import('../pages/Clients/ClientsPage').then(m => m.default) 
  },
  { 
    path: '/hearings', 
    component: () => import('../pages/Hearings/HearingsPage').then(m => m.default) 
  },
  { 
    path: '/tasks', 
    component: () => import('../pages/Tasks/TasksPage').then(m => m.default) 
  },
  { 
    path: '/calendar', 
    component: () => import('../pages/Calendar/CalendarPage').then(m => m.default) 
  },
  { 
    path: '/invoices', 
    component: () => import('../pages/Invoices/InvoicesPage').then(m => m.default) 
  },
  { 
    path: '/time-tracker', 
    component: () => import('../pages/TimeTracker/TimeTrackerPage').then(m => m.default) 
  },
  { 
    path: '/reports', 
    component: () => import('../pages/Reports/ReportsPage').then(m => m.default),
    roles: [ROLES.ADMIN] 
  },
];