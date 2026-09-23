export interface ApiErrorResponse {
  title?: string;
  detail?: string;
  message?: string;
  status?: number;
  instance?: string;
  path?: string;
}