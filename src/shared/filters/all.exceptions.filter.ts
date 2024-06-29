import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateGenericResponse } from '../responses/create.response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const code = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : 'Internal server error';
    const name = exception instanceof HttpException ? exception.name : 'InternalServerError';
    const path = request.url;

    response.status(code).json(
      CreateGenericResponse(
        null,
        {
          code,
          message,
          name,
          path,
        },
        code,
      ),
    );
  }
}
