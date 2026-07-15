import type { DocumentDto, DocumentStats, Paginated } from '@coresphere/shared';
import { apiClient, ApiClientError } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';
import { env } from '@/config/env';
import { getAccessToken } from '@/lib/authToken';

export interface DocumentListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
}

export const documentsApi = {
  list(params: DocumentListParams): Promise<Paginated<DocumentDto>> {
    return apiClient.get<Paginated<DocumentDto>>(`/documents${toQueryString({ ...params })}`);
  },
  stats(): Promise<DocumentStats> {
    return apiClient.get<DocumentStats>('/documents/stats');
  },
  upload(file: File, meta: { name?: string; category: string; description?: string }): Promise<DocumentDto> {
    const form = new FormData();
    form.append('file', file);
    if (meta.name) form.append('name', meta.name);
    form.append('category', meta.category);
    if (meta.description) form.append('description', meta.description);
    return apiClient.post<DocumentDto>('/documents', form);
  },
  remove(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/documents/${id}`);
  },

  /** Downloads the file with auth and saves it via a temporary link. */
  async download(id: string, filename: string): Promise<void> {
    const token = getAccessToken();
    const res = await fetch(`${env.VITE_API_BASE_URL}/documents/${id}/download`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new ApiClientError('Download failed', 'DOWNLOAD_ERROR', res.status);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
