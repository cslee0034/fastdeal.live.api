import { Payload } from '../../modules/auth/interfaces/payload.interface';

export interface TokenPayload extends Payload {
  iat: number;
  exp: number;
}
