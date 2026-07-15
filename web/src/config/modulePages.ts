import {
  BarChart3,
  FileBarChart,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { type Role, Role as Roles } from '@coresphere/shared';

export interface ModulePage {
  path: string;
  title: string;
  description: string;
  icon: LucideIcon;
  phase: string;
  roles: Role[];
}

/** Not-yet-built module routes. Kept in sync with the sidebar navigation. */
export const modulePages: ModulePage[] = [
  { path: '/reports', title: 'Reports', description: 'Operational and financial reporting.', icon: FileBarChart, phase: 'Phase 12', roles: [] },
  { path: '/analytics', title: 'Analytics', description: 'Cross-module analytics and insights.', icon: BarChart3, phase: 'Phase 12', roles: [] },
  { path: '/settings', title: 'System Settings', description: 'Organization and platform configuration.', icon: Settings, phase: 'Phase 13', roles: [Roles.SuperAdmin] },
];
