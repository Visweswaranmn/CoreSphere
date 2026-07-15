import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import type { DocumentDto } from '@coresphere/shared';

export interface DocumentAttrs {
  name: string;
  category: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedBy: Types.ObjectId;
  description?: string;
}

export interface DocumentDoc extends DocumentAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentHydrated = HydratedDocument<DocumentDoc>;

const documentSchema = new Schema<DocumentDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200, index: true },
    category: { type: String, required: true, index: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

interface PopulatedUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

export function toDocumentDto(doc: DocumentHydrated): DocumentDto {
  const uploader = doc.uploadedBy as unknown as PopulatedUser;
  return {
    id: doc.id as string,
    name: doc.name,
    category: doc.category,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    size: doc.size,
    uploadedById: String(uploader._id ?? doc.uploadedBy),
    uploadedByName: uploader.firstName ? `${uploader.firstName} ${uploader.lastName}`.trim() : 'Unknown',
    ...(doc.description ? { description: doc.description } : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

export const DocumentModel: Model<DocumentDoc> = model<DocumentDoc>('Document', documentSchema);
