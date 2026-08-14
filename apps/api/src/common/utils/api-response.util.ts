import type {
  ApiError,
  ApiResponse,
} from '../interfaces/api-response.interface.js';

export function successResponse<T>(
  message: string,
  data: T,
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    error: null,
  };
}

export function errorResponse(
  message: string,
  code: string,
  details?: unknown,
): ApiResponse<null> {
  const error: ApiError = {
    code,
    details,
  };

  return {
    success: false,
    message,
    data: null,
    error,
  };
}