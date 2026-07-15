export const DOCUMENT_CATEGORIES = [
  'Contract',
  'Invoice',
  'Report',
  'Policy',
  'Presentation',
  'Spreadsheet',
  'Image',
  'Other',
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export interface DocumentDto {
  id: string;
  name: string;
  category: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedById: string;
  uploadedByName: string;
  description?: string;
  createdAt: string;
}

export interface DocumentStats {
  total: number;
  totalSize: number;
  byCategory: { category: string; count: number }[];
}
