import { unlink } from 'node:fs/promises';
import path from 'node:path';
import type { DocumentDto, DocumentStats } from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../config/logger';
import { UPLOADS_DIR } from '../../config/upload';
import { documentRepository } from './document.repository';
import { toDocumentDto } from './document.model';
import type { ListDocumentsQuery, UploadDocumentInput } from './document.schemas';

export interface DownloadTarget {
  path: string;
  originalName: string;
  mimeType: string;
}

export const documentService = {
  async list(query: ListDocumentsQuery): Promise<{ items: DocumentDto[]; total: number }> {
    const { items, total } = await documentRepository.findPaginated(query);
    return { items: items.map(toDocumentDto), total };
  },

  async create(
    file: Express.Multer.File,
    input: UploadDocumentInput,
    userId: string,
  ): Promise<DocumentDto> {
    const document = await documentRepository.create({
      name: input.name?.trim() || file.originalname,
      category: input.category,
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: userId as unknown as never,
      ...(input.description ? { description: input.description } : {}),
    });
    const populated = await documentRepository.findById(document.id as string);
    return toDocumentDto(populated!);
  },

  async getDownload(id: string): Promise<DownloadTarget> {
    const document = await documentRepository.findByIdRaw(id);
    if (!document) throw ApiError.notFound('Document not found');
    return {
      path: path.join(UPLOADS_DIR, document.filename),
      originalName: document.originalName,
      mimeType: document.mimeType,
    };
  },

  async remove(id: string): Promise<void> {
    const document = await documentRepository.findByIdRaw(id);
    if (!document) throw ApiError.notFound('Document not found');

    await documentRepository.deleteById(id);
    // Best-effort file cleanup; a missing file should not fail the request.
    try {
      await unlink(path.join(UPLOADS_DIR, document.filename));
    } catch (err) {
      logger.warn({ err, filename: document.filename }, 'Failed to delete document file');
    }
  },

  async stats(): Promise<DocumentStats> {
    return documentRepository.stats();
  },
};
