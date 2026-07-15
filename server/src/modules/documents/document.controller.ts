import { existsSync } from 'node:fs';
import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { ApiError } from '../../utils/ApiError';
import { documentService } from './document.service';
import type { ListDocumentsQuery, UploadDocumentInput } from './document.schemas';

export const listDocuments = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListDocumentsQuery;
  const { items, total } = await documentService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getDocumentStats = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await documentService.stats());
});

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('A file is required');
  if (!req.user) throw ApiError.unauthorized();
  const document = await documentService.create(req.file, req.body as UploadDocumentInput, req.user.id);
  return sendSuccess(res, document, 201, 'Document uploaded');
});

export const downloadDocument = asyncHandler(async (req: Request, res: Response) => {
  const target = await documentService.getDownload(req.params.id as string);
  if (!existsSync(target.path)) throw ApiError.notFound('File is no longer available');
  res.setHeader('Content-Type', target.mimeType);
  return res.download(target.path, target.originalName);
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  await documentService.remove(req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Document removed');
});
