import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();

    const request =
      ctx.getRequest<Request>();

    if (!(exception instanceof HttpException)) {
      console.error('[Unhandled error]', exception);
    }

    const response =
      ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      'Internal server error';

    let code =
      'INTERNAL_SERVER_ERROR';

    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse =
        exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const body =
          exceptionResponse as Record<
            string,
            unknown
          >;

        const exceptionMessage =
          body.message;

        if (Array.isArray(exceptionMessage)) {
          message = 'Validation failed';
          details = exceptionMessage;
        } else if (
          typeof exceptionMessage === 'string'
        ) {
          message = exceptionMessage;
        }

        code =
          typeof body.error === 'string'
            ? body.error.toUpperCase().replace(/ /g, '_')
            : this.getErrorCode(status);
      }
    }

    response.status(status).json({
      success: false,
      message,
      data: null,
      error: {
        code,
        details,
      },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';

      case 401:
        return 'UNAUTHORIZED';

      case 403:
        return 'FORBIDDEN';

      case 404:
        return 'NOT_FOUND';

      case 409:
        return 'CONFLICT';

      case 429:
        return 'TOO_MANY_REQUESTS';

      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}