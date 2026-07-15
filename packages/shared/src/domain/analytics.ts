export interface DashboardKpis {
  revenue: number;
  profit: number;
  expenses: number;
  employees: number;
  activeProjects: number;
  inventoryValue: number;
}

export interface MonthlyPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export interface NamedValue {
  name: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

export interface AnalyticsOverview {
  kpis: DashboardKpis;
  revenueExpense: MonthlyPoint[];
  expenseByCategory: NamedValue[];
  dealsByStage: NamedValue[];
  employeesByDepartment: NamedValue[];
  projectsByStatus: NamedValue[];
  inventoryByCategory: NamedValue[];
  recentActivity: ActivityItem[];
}
