import { Payload } from '../../modules/auth/interface/payload.interface';

export interface TokenPayload extends Payload {
  iat: number;
  exp: number;
}
