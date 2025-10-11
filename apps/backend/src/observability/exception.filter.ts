import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ProblemDetails {
  status: number;
  code: string;
  message: string;
  requestId?: string;
  timestamp: string;
  path: string;
  method: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const method = request.method;
    const path = request.url;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        code = (exceptionResponse as any).error || exception.name;
      } else {
        message = exception.message;
        code = exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name;
    }

    // Get request ID safely - never set undefined as header
    const current = response.getHeader('X-Request-Id') as string | undefined;
    const requestId = current || (request as any).requestId;

    const problemDetails: ProblemDetails = {
      status,
      code,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      path,
      method,
    };

    // Log the error
    this.logger.error(
      `Exception occurred: ${code} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      {
        requestId,
        method,
        path,
        status,
      }
    );

    // Set response headers - only if requestId exists
    if (requestId) {
      response.setHeader('X-Request-Id', String(requestId));
    }
    response.setHeader('Content-Type', 'application/problem+json');

    // Send response
    response.status(status).json(problemDetails);
  }
}
