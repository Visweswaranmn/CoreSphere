import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { objectId } from '../employees/employee.schemas';
import {
  createRunSchema,
  listPayslipsQuerySchema,
  listRunsQuerySchema,
  listStructuresQuerySchema,
  upsertStructureSchema,
} from './payroll.schemas';
import {
  createRun,
  getPayslip,
  getRun,
  getStructure,
  listPayslips,
  listRuns,
  listStructures,
  payRun,
  processRun,
  upsertStructure,
} from './payroll.controller';

export const payrollRouter: Router = Router();

const idParams = z.object({ id: objectId });
const employeeParams = z.object({ employeeId: objectId });

// Payroll is available to HR Managers and Finance Managers (Super Admin bypasses).
payrollRouter.use(authenticate, authorize(Role.HrManager, Role.FinanceManager));

// Salary structures
payrollRouter.get('/structures', validate({ query: listStructuresQuerySchema }), listStructures);
payrollRouter.get(
  '/structures/employee/:employeeId',
  validate({ params: employeeParams }),
  getStructure,
);
payrollRouter.put(
  '/structures/employee/:employeeId',
  validate({ params: employeeParams, body: upsertStructureSchema }),
  upsertStructure,
);

// Payroll runs
payrollRouter.get('/runs', validate({ query: listRunsQuerySchema }), listRuns);
payrollRouter.post('/runs', validate({ body: createRunSchema }), createRun);
payrollRouter.get('/runs/:id', validate({ params: idParams }), getRun);
payrollRouter.post('/runs/:id/process', validate({ params: idParams }), processRun);
payrollRouter.post('/runs/:id/pay', validate({ params: idParams }), payRun);

// Payslips
payrollRouter.get('/payslips', validate({ query: listPayslipsQuerySchema }), listPayslips);
payrollRouter.get('/payslips/:id', validate({ params: idParams }), getPayslip);
