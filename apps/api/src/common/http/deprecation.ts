import { Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

import { REQUEST_ID_HEADER } from '../middleware/request-context.middleware';

const DEFAULT_SUNSET_WINDOW_DAYS = 90;

interface MarkDeprecatedRouteParams {
  canonicalPath: string;
  logger: Logger;
  req: Request;
  res: Response;
}

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

function toSunsetDate(daysFromNow: number): string {
  const sunsetDate = new Date(
    Date.now() + daysFromNow * 24 * 60 * 60 * 1000
  );
  return sunsetDate.toUTCString();
}

export function markDeprecatedRoute({
  canonicalPath,
  logger,
  req,
  res,
}: MarkDeprecatedRouteParams) {
  res.setHeader('Deprecation', 'true');
  res.setHeader('Sunset', toSunsetDate(DEFAULT_SUNSET_WINDOW_DAYS));
  res.setHeader('Link', `<${canonicalPath}>; rel="successor-version"`);

  const requestId = toRequestId(req, res);

  logger.warn(
    `[deprecated-route] ${req.method} ${req.originalUrl || req.url} -> ${canonicalPath} [${requestId}]`
  );
}
