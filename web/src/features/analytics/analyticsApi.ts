import type { AnalyticsOverview } from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';

export const analyticsApi = {
  overview(): Promise<AnalyticsOverview> {
    return apiClient.get<AnalyticsOverview>('/analytics/overview');
  },
};
