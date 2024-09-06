import { Payload } from '../../infrastructure/token/interface/payload.interface';

export interface TokenPayload extends Payload {
  iat: number;
  exp: number;
}
