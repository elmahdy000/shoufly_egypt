export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return new ApiError(401, error.message);
    }
    if (error.message === 'Forbidden') {
      return new ApiError(403, error.message);
    }
    if (error.message.toLowerCase().includes('not found')) {
      return new ApiError(404, error.message);
    }
    return new ApiError(400, error.message);
  }

  return new ApiError(500, 'Internal server error');
}
