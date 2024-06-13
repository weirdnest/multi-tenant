import { Request, Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  HttpServer,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { BaseExceptionFilter, ModuleRef } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';
import { HttpStatusMessage, PgErrorCode, PgErrorMessage } from '../constants';
// import { IRequestContext, CONTEXT_ID, RequestContextService } from "@app/utils/config";
// import { ILogger } from '@app/utils/logger/interfaces/logger.interface';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter extends BaseExceptionFilter {

  async catch(exception: any, context: ArgumentsHost): Promise<void> {
    // const contextId = await this.requestContext.get(CONTEXT_ID);
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = HttpStatusMessage.INTERNAL_SERVER_ERROR;
    const timestamp = new Date().toISOString();

    const {
      name: exceptionName,
      message: exceptionMessage,
      parameters: exceptionParameters,
      query: exceptionQuery,
      code,
      detail,
    } = exception || {};

    // this.requestContext.addContext(`${this.constructor.name}.${this.catch.name}`, { exception });
    // this.logger.log({ contextId, code, detail }, `${this.constructor.name}.catch`);

    if (code === PgErrorCode.DUPLICATED_UNIQUE) {
      message = detail || PgErrorMessage.DUPLICATED_UNIQUE;
      statusCode = HttpStatus.CONFLICT;
      // this.logger.verbose(
      //   { statusCode, message, callStack: this.requestContext.getCallstack() },
      //   `${this.constructor.name}.${this.catch.name}`
      // );
    } else if (code === PgErrorCode.UNEXPECTED_DATA) {
      message = PgErrorMessage.UNEXPECTED_DATA;
      statusCode = HttpStatus.BAD_REQUEST;
      console.error(`QueryFailedExceptionFilter: unexpectedData:`, exception);
      // this.logger.verbose(
      //   { statusCode, message, callStack: this.requestContext.getCallstack() },
      //   `${this.constructor.name}.${this.catch.name}`
      // );
    } else if (code === PgErrorCode.UNDEFINED_TABLE) {
      message = PgErrorMessage.UNDEFINED_TABLE;
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      // this.logger.error(
      //   { exception },
      //   `${this.constructor.name}.${this.catch.name}`
      // );
    } else if (code === PgErrorCode.COLUMN_DOES_NOT_EXIST) {
      message = PgErrorMessage.COLUMN_DOES_NOT_EXIST;
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      // this.logger.error(
      //   { exception },
      //   `${this.constructor.name}.${this.catch.name}`
      // );
    } else if (code === PgErrorCode.FOREIGN_KEY_VIOLATION) {
      message = PgErrorMessage.FOREIGN_KEY_VIOLATION;
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      // this.logger.error(
      //   { exception },
      //   `${this.constructor.name}.${this.catch.name}`
      // );
    } else if (code === PgErrorCode.INVALID_TEXT_REPRESENTATION) {
      message = PgErrorMessage.INVALID_TEXT_REPRESENTATION;
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      // this.logger.error(
      //   { exception },
      //   `${this.constructor.name}.${this.catch.name}`
      // );
    } else {
      console.error(`QueryFailedException: unknown exception:`, exception);
      // error not expected yet
      // this.logger.error(
      //   { exception, callStack: this.requestContext.getCallstack() },
      //   `${this.constructor.name}.${this.catch.name}`
      // );
    }

    const ctx = context.switchToHttp();
    const response: any = ctx.getResponse<Response>();
    const request: any = ctx.getRequest<Request>();

    response.status(statusCode).json({
      error: {
        statusCode,
        message,
        timestamp,
        path: request.url,
      },
    });
  }
}
