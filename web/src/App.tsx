import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Role } from '@coresphere/shared';
import { useAuth } from '@/features/auth/useAuth';
import { FullPageLoader } from '@/components/FullPageLoader';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleRoute } from '@/routes/RoleRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { ModulePlaceholder } from '@/pages/ModulePlaceholder';
import { modulePages } from '@/config/modulePages';

// Code-split heavy feature areas so they load on demand.
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const EmployeesPage = lazy(() =>
  import('@/features/employees/EmployeesPage').then((m) => ({ default: m.EmployeesPage })),
);
const EmployeeDetailPage = lazy(() =>
  import('@/features/employees/EmployeeDetailPage').then((m) => ({ default: m.EmployeeDetailPage })),
);
const AttendancePage = lazy(() =>
  import('@/features/attendance/AttendancePage').then((m) => ({ default: m.AttendancePage })),
);
const LeavePage = lazy(() =>
  import('@/features/leave/LeavePage').then((m) => ({ default: m.LeavePage })),
);
const PayrollPage = lazy(() =>
  import('@/features/payroll/PayrollPage').then((m) => ({ default: m.PayrollPage })),
);
const RunDetailPage = lazy(() =>
  import('@/features/payroll/RunDetailPage').then((m) => ({ default: m.RunDetailPage })),
);
const ProjectsPage = lazy(() =>
  import('@/features/projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
);
const ProjectDetailPage = lazy(() =>
  import('@/features/projects/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
);
const VendorsPage = lazy(() =>
  import('@/features/procurement/VendorsPage').then((m) => ({ default: m.VendorsPage })),
);
const OrdersPage = lazy(() =>
  import('@/features/procurement/OrdersPage').then((m) => ({ default: m.OrdersPage })),
);
const OrderDetailPage = lazy(() =>
  import('@/features/procurement/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })),
);
const InventoryItemsPage = lazy(() =>
  import('@/features/inventory/InventoryItemsPage').then((m) => ({ default: m.InventoryItemsPage })),
);
const ItemDetailPage = lazy(() =>
  import('@/features/inventory/ItemDetailPage').then((m) => ({ default: m.ItemDetailPage })),
);
const AssetsPage = lazy(() =>
  import('@/features/inventory/AssetsPage').then((m) => ({ default: m.AssetsPage })),
);

/** Redirects already-authenticated users away from the login screen. */
function LoginRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <FullPageLoader label="Restoring your session…" />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          {/* HR module (Phase 4) — restricted to HR Managers. */}
          <Route element={<RoleRoute allow={[Role.HrManager]} />}>
            <Route path="/hr/employees" element={<EmployeesPage />} />
            <Route path="/hr/employees/:id" element={<EmployeeDetailPage />} />
            <Route path="/hr/attendance" element={<AttendancePage />} />
            <Route path="/hr/leave" element={<LeavePage />} />
          </Route>

          {/* Payroll (Phase 5) — HR Managers and Finance Managers. */}
          <Route element={<RoleRoute allow={[Role.HrManager, Role.FinanceManager]} />}>
            <Route path="/hr/payroll" element={<PayrollPage />} />
            <Route path="/hr/payroll/runs/:id" element={<RunDetailPage />} />
          </Route>

          {/* Projects (Phase 6) — Project Managers. */}
          <Route element={<RoleRoute allow={[Role.ProjectManager]} />}>
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Route>

          {/* Procurement & Vendors (Phase 7) — Procurement Managers. */}
          <Route element={<RoleRoute allow={[Role.ProcurementManager]} />}>
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/procurement" element={<OrdersPage />} />
            <Route path="/procurement/orders/:id" element={<OrderDetailPage />} />
          </Route>

          {/* Inventory & Assets (Phase 8) — Inventory Managers. */}
          <Route element={<RoleRoute allow={[Role.InventoryManager]} />}>
            <Route path="/inventory" element={<InventoryItemsPage />} />
            <Route path="/inventory/items/:id" element={<ItemDetailPage />} />
            <Route path="/assets" element={<AssetsPage />} />
          </Route>

          {modulePages.map((page) => {
            const element = (
              <ModulePlaceholder
                title={page.title}
                description={page.description}
                icon={page.icon}
                phase={page.phase}
              />
            );

            return page.roles.length > 0 ? (
              <Route key={page.path} element={<RoleRoute allow={page.roles} />}>
                <Route path={page.path} element={element} />
              </Route>
            ) : (
              <Route key={page.path} path={page.path} element={element} />
            );
          })}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
