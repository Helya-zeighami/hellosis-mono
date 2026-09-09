import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import {
  BaseWsExceptionFilter,
} from '@nestjs/websockets';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse =
        exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const body =
          exceptionResponse as Record<string, unknown>;

        if (typeof body.message === 'string') {
          message = body.message;
        } else if (Array.isArray(body.message)) {
          message = 'Validation failed';
        }
      }

      code = this.getErrorCode(status);
    } else {
      console.error('[Unhandled ws error]', exception);
    }

    const client = host.switchToWs().getClient();

    client.emit('exception', {
      success: false,
      message,
      error: {
        code,
      },
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