// Response format types following the required specification

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message: string;
  meta?: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp?: string;
  path?: string;
  correlationId?: string;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;
