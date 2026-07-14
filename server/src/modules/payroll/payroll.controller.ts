import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { salaryStructureService } from './salaryStructure.service';
import { payrollRunService } from './payrollRun.service';
import type {
  CreateRunInput,
  ListPayslipsQuery,
  ListRunsQuery,
  ListStructuresQuery,
  UpsertStructureInput,
} from './payroll.schemas';

// ─── Salary structures ───────────────────────────────────────────────────────
export const listStructures = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListStructuresQuery;
  const { items, total } = await salaryStructureService.list(query.page, query.pageSize);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getStructure = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await salaryStructureService.getByEmployee(req.params.employeeId as string));
});

export const upsertStructure = asyncHandler(async (req: Request, res: Response) => {
  const structure = await salaryStructureService.upsert(
    req.params.employeeId as string,
    req.body as UpsertStructureInput,
  );
  return sendSuccess(res, structure, 200, 'Salary structure saved');
});

// ─── Payroll runs ────────────────────────────────────────────────────────────
export const listRuns = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListRunsQuery;
  const { items, total } = await payrollRunService.listRuns(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getRun = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await payrollRunService.getRun(req.params.id as string));
});

export const createRun = asyncHandler(async (req: Request, res: Response) => {
  const run = await payrollRunService.createRun(req.body as CreateRunInput);
  return sendSuccess(res, run, 201, 'Payroll run created');
});

export const processRun = asyncHandler(async (req: Request, res: Response) => {
  const run = await payrollRunService.processRun(req.params.id as string);
  return sendSuccess(res, run, 200, 'Payroll processed');
});

export const payRun = asyncHandler(async (req: Request, res: Response) => {
  const run = await payrollRunService.payRun(req.params.id as string);
  return sendSuccess(res, run, 200, 'Payroll marked as paid');
});

// ─── Payslips ────────────────────────────────────────────────────────────────
export const listPayslips = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListPayslipsQuery;
  const { items, total } = await payrollRunService.listPayslips(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getPayslip = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await payrollRunService.getPayslip(req.params.id as string));
});
