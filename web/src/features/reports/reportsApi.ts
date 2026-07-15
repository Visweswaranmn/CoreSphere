import type { ReportFormat, ReportType } from '@coresphere/shared';
import { env } from '@/config/env';
import { getAccessToken } from '@/lib/authToken';
import { ApiClientError } from '@/lib/apiClient';

/** Downloads a report export in the given format and saves it via a link. */
export async function downloadReport(type: ReportType, format: ReportFormat): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`${env.VITE_API_BASE_URL}/reports/${type}/export?format=${format}`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiClientError('Export failed', 'EXPORT_ERROR', res.status);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${type}-${new Date().toISOString().slice(0, 10)}.${format}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
