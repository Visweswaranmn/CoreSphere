import { Router } from 'express';
import { z } from 'zod';
import { REPORT_FORMATS, REPORT_TYPES } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { exportReport, listReports } from './report.controller';

export const reportRouter: Router = Router();

const asTuple = <T extends readonly string[]>(v: T) => [...v] as unknown as [string, ...string[]];

reportRouter.use(authenticate);

reportRouter.get('/', listReports);
reportRouter.get(
  '/:type/export',
  validate({
    params: z.object({ type: z.enum(asTuple(REPORT_TYPES)) }),
    query: z.object({ format: z.enum(asTuple(REPORT_FORMATS)).default('csv') }),
  }),
  exportReport,
);
