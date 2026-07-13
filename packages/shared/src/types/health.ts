/** Liveness/readiness payload returned by the API health endpoint. */
export interface HealthStatus {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  database: 'connected' | 'disconnected';
}
