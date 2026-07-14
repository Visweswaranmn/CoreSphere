import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  changeStatusSchema,
  createEmployeeSchema,
  listEmployeesQuerySchema,
  objectId,
  updateEmployeeSchema,
} from './employee.schemas';
import {
  changeEmployeeStatus,
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployeeStats,
  listEmployees,
  updateEmployee,
} from './employee.controller';

export const employeeRouter: Router = Router();

const idParams = z.object({ id: objectId });

// The entire HR module is restricted to HR Managers (Super Admin bypasses).
employeeRouter.use(authenticate, authorize(Role.HrManager));

employeeRouter.get('/', validate({ query: listEmployeesQuerySchema }), listEmployees);
employeeRouter.get('/stats', getEmployeeStats);
employeeRouter.post('/', validate({ body: createEmployeeSchema }), createEmployee);
employeeRouter.get('/:id', validate({ params: idParams }), getEmployee);
employeeRouter.patch(
  '/:id',
  validate({ params: idParams, body: updateEmployeeSchema }),
  updateEmployee,
);
employeeRouter.patch(
  '/:id/status',
  validate({ params: idParams, body: changeStatusSchema }),
  changeEmployeeStatus,
);
employeeRouter.delete('/:id', validate({ params: idParams }), deleteEmployee);
