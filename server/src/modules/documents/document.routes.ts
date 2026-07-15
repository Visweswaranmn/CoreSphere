import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { upload } from '../../config/upload';
import { objectId } from '../employees/employee.schemas';
import { listDocumentsQuerySchema, uploadDocumentSchema } from './document.schemas';
import {
  deleteDocument,
  downloadDocument,
  getDocumentStats,
  listDocuments,
  uploadDocument,
} from './document.controller';

export const documentRouter: Router = Router();

const idParams = z.object({ id: objectId });

// Documents are available to every authenticated user.
documentRouter.use(authenticate);

documentRouter.get('/', validate({ query: listDocumentsQuerySchema }), listDocuments);
documentRouter.get('/stats', getDocumentStats);
documentRouter.post(
  '/',
  upload.single('file'),
  validate({ body: uploadDocumentSchema }),
  uploadDocument,
);
documentRouter.get('/:id/download', validate({ params: idParams }), downloadDocument);
documentRouter.delete('/:id', validate({ params: idParams }), deleteDocument);
