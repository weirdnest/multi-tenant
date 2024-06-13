import { Request, Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter, ModuleRef } from '@nestjs/core';
import { HttpStatusMessage } from '../constants';
// import { ILogger } from '@app/utils/logger/interfaces/logger.interface';
// import { IRequestContext } from '@app/utils/config';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  // private context: IRequestContext;
  // private logger: ILogger;
  constructor() {
    // private readonly moduleRef: ModuleRef,
    super();
  }
  async onModuleInit() {
    // this.context = await this.moduleRef.resolve(IRequestContext);
    // this.logger = await this.moduleRef.resolve(ILogger);
    // this.logger.setContext(`HttpExceptionFilter`);
    // this.context.setContext(`HttpExceptionFilter`, {}, this.logger);
  }

  catch(exception: any, host: ArgumentsHost): void {
    // this.logger.debug({ exception });
    // console.error(`HttpExceptionFilter:`, exception);
    let path = ``;
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = HttpStatusMessage.INTERNAL_SERVER_ERROR;
    const timestamp = new Date().toISOString();

    if (typeof exception.getStatus === 'function') {
      statusCode = exception.getStatus() || statusCode;
    }
    if (typeof exception.getResponse === 'function') {
      message = exception.getResponse() || message;
    }

    if (typeof message === 'object') {
      const {
        message: messageNested,
        statusCode: statusCodeNested,
        path: pathNested,
      } = (message as any) || {};
      if (messageNested) {
        if (messageNested) message = messageNested;
        if (statusCodeNested) statusCode = statusCodeNested;
        if (pathNested) path = pathNested;
      }
    }
    console.log(`HttpExceptionFilter:`, { statusCode, message });

    if (
      statusCode === HttpStatus.INTERNAL_SERVER_ERROR ||
      statusCode === HttpStatus.FORBIDDEN
    ) {
      console.error(`HttpExceptionFilter:`, exception);
    }

    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse<Response>();
    const request: any = ctx.getRequest<Request>();

    // this.context.addContext(this.catch.name, { exception }, this.logger);

    response.status(statusCode).json({
      error: {
        statusCode,
        message,
        timestamp,
        path: path || request.url,
      },
    });
  }
}
