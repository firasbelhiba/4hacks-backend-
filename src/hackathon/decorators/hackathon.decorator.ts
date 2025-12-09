import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Hackathon = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.hackathon;
  },
);
