import { z } from 'zod';
import { DOCUMENT_CATEGORIES } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';

const categoryEnum = z.enum([...DOCUMENT_CATEGORIES] as unknown as [string, ...string[]]);

/** Text fields sent alongside the multipart file upload. */
export const uploadDocumentSchema = z.object({
  name: z.string().trim().max(200).optional(),
  category: categoryEnum,
  description: z.string().trim().max(500).optional(),
});

export const listDocumentsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
