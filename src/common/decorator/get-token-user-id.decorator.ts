import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Payload } from '../../infrastructure/token/interface/payload.interface';

export const GetTokenUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as Payload;
    return user.id;
  },
);
