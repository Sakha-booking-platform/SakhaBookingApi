import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CURRENT_USER_KEY } from 'src/utils/conistants';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request[CURRENT_USER_KEY];
  },
);