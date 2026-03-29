import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

function normalizeHeaderValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const incomingRequestId = normalizeHeaderValue(req.headers[REQUEST_ID_HEADER]);
  const requestId = incomingRequestId.trim() || randomUUID();

  (req.headers as Record<string, string | string[] | undefined>)[
    REQUEST_ID_HEADER
  ] = requestId;
  (res.locals as Record<string, string>).requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  next();
}
