import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { ENCRYPT_ERROR } from '../error/encrypt.error';

@Injectable()
export class EncryptService {
  constructor(private readonly configService: ConfigService) {}

  async hash(key: string): Promise<string> {
    try {
      const salt = this.configService.get<string>('encrypt.salt');
      return await bcrypt.hash(key, Number(salt));
    } catch (error) {
      throw new InternalServerErrorException(ENCRYPT_ERROR.FAILED_TO_HASH_KEY);
    }
  }

  async compare(key: string, hashedKey: string): Promise<boolean> {
    try {
      return await bcrypt.compare(key, hashedKey);
    } catch (error) {
      throw new InternalServerErrorException(
        ENCRYPT_ERROR.FAILED_TO_COMPARE_KEY,
      );
    }
  }

  async compareAndThrow(key: string, hashedKey: string): Promise<void> {
    const isSame = await this.compare(key, hashedKey);
    if (!isSame) {
      throw new UnauthorizedException(ENCRYPT_ERROR.PASSWORD_DO_NOT_MATCH);
    }
    return;
  }
}
