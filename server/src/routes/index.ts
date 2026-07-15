import { Router } from 'express';
import { healthRouter } from '../modules/health/health.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { employeeRouter } from '../modules/employees/employee.routes';
import { attendanceRouter } from '../modules/attendance/attendance.routes';
import { leaveRouter } from '../modules/leave/leave.routes';
import { payrollRouter } from '../modules/payroll/payroll.routes';
import { projectRouter } from '../modules/projects/project.routes';
import { procurementRouter } from '../modules/procurement/procurement.routes';
import { inventoryRouter } from '../modules/inventory/inventory.routes';
import { customerRouter } from '../modules/crm/customer.routes';
import { dealRouter } from '../modules/sales/deal.routes';
import { financeRouter } from '../modules/finance/finance.routes';
import { documentRouter } from '../modules/documents/document.routes';
import { notificationRouter } from '../modules/notifications/notification.routes';

/** Root API router. Feature modules mount their sub-routers here. */
export const apiRouter: Router = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/hr/employees', employeeRouter);
apiRouter.use('/hr/attendance', attendanceRouter);
apiRouter.use('/hr/leave', leaveRouter);
apiRouter.use('/hr/payroll', payrollRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/procurement', procurementRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/crm/customers', customerRouter);
apiRouter.use('/sales/deals', dealRouter);
apiRouter.use('/finance', financeRouter);
apiRouter.use('/documents', documentRouter);
apiRouter.use('/notifications', notificationRouter);
