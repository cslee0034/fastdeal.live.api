import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Payload } from '../../modules/auth/types/payload.type';

export const GetTokenUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as Payload;
    return user.id;
  },
);
