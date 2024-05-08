import { Payload } from '../../modules/auth/types/payload.type';

export type TokenPayload = Payload & {
  iat: number;
  exp: number;
};
