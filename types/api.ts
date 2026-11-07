export type ApiMeta = {
  timestamp: string;
  requestId: string;
  [key: string]: unknown;
};

export type ApiErrorDetail = {
  message: string;
  code?: number;
  details?: unknown[];
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: ApiErrorDetail | null;
  meta: ApiMeta;
};

export type ApiErrorResponse = {
  detail?: string | { loc: (string | number)[]; msg: string; type: string }[];
  error?: ApiErrorDetail;
  message?: string;
  meta?: ApiMeta;
};

export type ApiSuccess<T> = {
  data: T;
};

export type PaginatedResponse<T> = {
  items: T[];
  total?: number;
};
