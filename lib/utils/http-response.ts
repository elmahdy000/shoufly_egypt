import { NextResponse } from 'next/server';
import { toApiError } from '@/lib/utils/api-error';

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(error: unknown) {
  const apiError = toApiError(error);
  return NextResponse.json(
    {
      error: apiError.message,
    },
    { status: apiError.status }
  );
}
