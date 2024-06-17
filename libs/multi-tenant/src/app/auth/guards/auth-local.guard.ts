import {
  BadRequestException,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '../dto/login.dto';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthLocalGuard extends AuthGuard('local') {
  constructor() {
    // @Inject(ILogger) private readonly logger: ILogger, // @Inject(IRequestContext) private readonly requestContext: IRequestContext,
    super();
    // this.requestContext.setContext(this.constructor.name, { logger });
  }

  async canActivate(host: ExecutionContext): Promise<boolean> {
    const context = host.switchToHttp();
    const request = context.getRequest();

    // this.requestContext.addContext(this.canActivate.name, { body: request.body, logger: this.logger });

    const body = plainToClass(LoginDto, request.body);
    const errors = await validate(body);
    const errorMessages = errors.flatMap(({ constraints }) =>
      Object.values(constraints),
    );

    if (errorMessages.length > 0) {
      throw new BadRequestException({
        message: errorMessages,
      });
    }

    // console.log(`AuthLocalGuard.canActivate: body:`, body);
    return super.canActivate(host) as Promise<boolean>;
  }
}
