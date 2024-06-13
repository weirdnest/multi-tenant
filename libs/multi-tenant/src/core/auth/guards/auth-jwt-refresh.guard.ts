import {
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { JwtRefreshDto } from '../dto/jwt-refresh.dto';
import { validate } from 'class-validator';

@Injectable()
export class AuthJwtRefreshGuard extends AuthGuard('jwt-refresh-token') {
  constructor() {
    super();
  }

  async canActivate(host: ExecutionContext) {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();

    const body = plainToClass(JwtRefreshDto, request.body);
    const errors = await validate(body);
    const errorMessages = errors.flatMap(({ constraints }) =>
      Object.values(constraints),
    );

    if (errorMessages.length > 0) {
      // return bad request if validation fails
      return response.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: errorMessages,
      });
    }

    return super.canActivate(host);
  }
}
