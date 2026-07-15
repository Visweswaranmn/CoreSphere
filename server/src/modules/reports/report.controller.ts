import type { Request, Response } from 'express';
import { REPORTS, type ReportFormat, type ReportType } from '@coresphere/shared';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { getReportData } from './report.service';
import { toCsv, toPdf, toXlsx } from './report.export';

const CONTENT_TYPES: Record<ReportFormat, string> = {
  csv: 'text/csv; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

export const listReports = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, REPORTS);
});

export const exportReport = asyncHandler(async (req: Request, res: Response) => {
  const type = req.params.type as ReportType;
  const format = (req.query.format as ReportFormat) ?? 'csv';
  const data = await getReportData(type);

  const filename = `${type}-${new Date().toISOString().slice(0, 10)}.${format}`;
  res.setHeader('Content-Type', CONTENT_TYPES[format]);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  if (format === 'csv') return res.send(toCsv(data));
  if (format === 'xlsx') return res.send(await toXlsx(data));
  return res.send(await toPdf(data));
});
