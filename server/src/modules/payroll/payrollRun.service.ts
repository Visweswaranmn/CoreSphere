import { type Types } from 'mongoose';
import {
  computePay,
  EmployeeStatus,
  type PayrollRunDto,
  PayrollRunStatus,
  type PayslipDto,
} from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { salaryStructureRepository } from './salaryStructure.repository';
import { payrollRunRepository } from './payrollRun.repository';
import { payslipRepository } from './payslip.repository';
import { toPayrollRunDto } from './payrollRun.model';
import { toPayslipDto } from './payslip.model';
import type { PayslipAttrs } from './payslip.model';
import type { CreateRunInput, ListPayslipsQuery, ListRunsQuery } from './payroll.schemas';

interface StructureEmployee {
  _id: Types.ObjectId;
  status: string;
}

export const payrollRunService = {
  async listRuns(query: ListRunsQuery): Promise<{ items: PayrollRunDto[]; total: number }> {
    const { items, total } = await payrollRunRepository.findPaginated(query);
    return { items: items.map(toPayrollRunDto), total };
  },

  async getRun(id: string): Promise<PayrollRunDto> {
    const run = await payrollRunRepository.findById(id);
    if (!run) throw ApiError.notFound('Payroll run not found');
    return toPayrollRunDto(run);
  },

  async createRun(input: CreateRunInput): Promise<PayrollRunDto> {
    if (await payrollRunRepository.existsForPeriod(input.month, input.year)) {
      throw ApiError.conflict('A payroll run already exists for this period');
    }
    const run = await payrollRunRepository.create({
      month: input.month,
      year: input.year,
      status: PayrollRunStatus.Draft,
      ...(input.notes ? { notes: input.notes } : {}),
    });
    return toPayrollRunDto(run);
  },

  /** Snapshots every active employee's salary structure into payslips. */
  async processRun(id: string): Promise<PayrollRunDto> {
    const run = await payrollRunRepository.findById(id);
    if (!run) throw ApiError.notFound('Payroll run not found');
    if (run.status !== PayrollRunStatus.Draft) {
      throw ApiError.badRequest('Only draft runs can be processed');
    }

    const structures = await salaryStructureRepository.findAllForProcessing();
    const payslips: PayslipAttrs[] = structures
      .filter((s) => (s.employee as unknown as StructureEmployee).status === EmployeeStatus.Active)
      .map((s) => {
        const allowances = s.allowances.map((a) => ({ name: a.name, amount: a.amount }));
        const deductions = s.deductions.map((d) => ({ name: d.name, amount: d.amount }));
        const totals = computePay(s.basicSalary, allowances, deductions);
        return {
          run: run._id,
          employee: (s.employee as unknown as StructureEmployee)._id,
          month: run.month,
          year: run.year,
          basicSalary: s.basicSalary,
          allowances,
          deductions,
          grossPay: totals.grossPay,
          totalDeductions: totals.totalDeductions,
          netPay: totals.netPay,
          status: PayrollRunStatus.Processed,
        };
      });

    await payslipRepository.deleteByRun(id);
    if (payslips.length > 0) await payslipRepository.insertMany(payslips);

    run.status = PayrollRunStatus.Processed;
    run.processedAt = new Date();
    run.employeeCount = payslips.length;
    run.totalGross = payslips.reduce((sum, p) => sum + p.grossPay, 0);
    run.totalDeductions = payslips.reduce((sum, p) => sum + p.totalDeductions, 0);
    run.totalNet = payslips.reduce((sum, p) => sum + p.netPay, 0);
    await run.save();

    return toPayrollRunDto(run);
  },

  async payRun(id: string): Promise<PayrollRunDto> {
    const run = await payrollRunRepository.findById(id);
    if (!run) throw ApiError.notFound('Payroll run not found');
    if (run.status !== PayrollRunStatus.Processed) {
      throw ApiError.badRequest('Only processed runs can be marked as paid');
    }

    run.status = PayrollRunStatus.Paid;
    run.paidAt = new Date();
    await run.save();
    await payslipRepository.updateStatusByRun(id, PayrollRunStatus.Paid);

    return toPayrollRunDto(run);
  },

  async listPayslips(query: ListPayslipsQuery): Promise<{ items: PayslipDto[]; total: number }> {
    const { items, total } = await payslipRepository.findPaginated(query);
    return { items: items.map(toPayslipDto), total };
  },

  async getPayslip(id: string): Promise<PayslipDto> {
    const payslip = await payslipRepository.findById(id);
    if (!payslip) throw ApiError.notFound('Payslip not found');
    return toPayslipDto(payslip);
  },
};
