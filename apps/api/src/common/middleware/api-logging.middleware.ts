import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { REQUEST_ID_HEADER } from './request-context.middleware';

const logger = new Logger('ApiLogger');

function toRequestId(req: Request, res: Response): string {
  const localRequestId = (res.locals as Record<string, string | undefined>)
    .requestId;
  if (localRequestId) {
    return localRequestId;
  }

  const headerValue = req.headers[REQUEST_ID_HEADER];
  if (Array.isArray(headerValue)) {
    return headerValue[0] ?? 'unknown';
  }

  return headerValue ?? 'unknown';
}

function shouldSkipLog(url: string): boolean {
  return url.startsWith('/api/health');
}

export function apiLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const url = req.originalUrl || req.url;

    if (shouldSkipLog(url)) {
      return;
    }

    const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);
    const requestId = toRequestId(req, res);

    logger.log(`${req.method} ${url} ${res.statusCode} ${durationMs}ms [${requestId}]`);
  });

  next();
}
