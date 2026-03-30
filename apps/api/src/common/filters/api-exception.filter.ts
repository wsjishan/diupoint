import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { REQUEST_ID_HEADER } from '../middleware/request-context.middleware';

type NestErrorBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  [key: string]: unknown;
};

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

function toNestErrorBody(
  exception: HttpException,
  statusCode: number
): NestErrorBody {
  const responseBody = exception.getResponse();

  if (typeof responseBody === 'string') {
    return {
      statusCode,
      message: responseBody,
      error: exception.name,
    };
  }

  return {
    statusCode,
    ...(responseBody as NestErrorBody),
  };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const requestId = toRequestId(request, response);

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const baseBody: NestErrorBody =
      exception instanceof HttpException
        ? toNestErrorBody(exception, statusCode)
        : {
            statusCode,
            message: 'Internal server error',
            error: 'Internal Server Error',
          };

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const error =
        exception instanceof Error
          ? exception
          : new Error(
              typeof exception === 'string'
                ? exception
                : 'Unknown internal exception'
            );

      this.logger.error(
        `${request.method} ${request.originalUrl || request.url} ${statusCode} [${requestId}] ${error.name}: ${error.message}`,
        error.stack
      );
    }

    response.status(statusCode).json({
      ...baseBody,
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.originalUrl || request.url,
      requestId,
    });
  }
}
