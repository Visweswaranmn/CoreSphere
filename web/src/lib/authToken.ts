/**
 * In-memory access-token store. Keeping the access token out of localStorage
 * reduces XSS exposure; it is re-obtained on load via the refresh cookie.
 */

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Returns a fresh access token, or null if the session cannot be refreshed. */
export type RefreshHandler = () => Promise<string | null>;

let refreshHandler: RefreshHandler | null = null;
let inflight: Promise<string | null> | null = null;

/** Registered by the AuthProvider so the API client can silently refresh. */
export function setRefreshHandler(handler: RefreshHandler | null): void {
  refreshHandler = handler;
}

/** Runs a single shared refresh, de-duplicating concurrent 401 responses. */
export function runRefresh(): Promise<string | null> {
  if (!refreshHandler) return Promise.resolve(null);
  if (!inflight) {
    inflight = refreshHandler().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}
