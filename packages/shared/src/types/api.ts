/**
 * Canonical response envelope shared by the API and the web client.
 * Every endpoint returns either an {@link ApiSuccess} or an {@link ApiFailure}.
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiFailure {
  success: false;
  message: string;
  /** Machine-readable error code, e.g. `VALIDATION_ERROR`, `UNAUTHORIZED`. */
  code: string;
  /** Field-level details, present for validation failures. */
  errors?: ApiFieldError[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}
