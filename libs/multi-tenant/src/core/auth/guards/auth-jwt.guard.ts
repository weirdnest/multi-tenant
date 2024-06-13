import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class AuthJwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
