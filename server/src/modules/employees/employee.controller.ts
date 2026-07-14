import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { employeeService } from './employee.service';
import type {
  ChangeStatusInput,
  CreateEmployeeInput,
  ListEmployeesQuery,
  UpdateEmployeeInput,
} from './employee.schemas';

export const listEmployees = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListEmployeesQuery;
  const { items, total } = await employeeService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getEmployeeStats = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await employeeService.stats());
});

export const getEmployee = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await employeeService.getById(req.params.id as string));
});

export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.create(req.body as CreateEmployeeInput);
  return sendSuccess(res, employee, 201, 'Employee created');
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.update(req.params.id as string, req.body as UpdateEmployeeInput);
  return sendSuccess(res, employee, 200, 'Employee updated');
});

export const changeEmployeeStatus = asyncHandler(async (req: Request, res: Response) => {
  const employee = await employeeService.changeStatus(
    req.params.id as string,
    req.body as ChangeStatusInput,
  );
  return sendSuccess(res, employee, 200, 'Status updated');
});

export const deleteEmployee = asyncHandler(async (req: Request, res: Response) => {
  await employeeService.remove(req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Employee removed');
});
