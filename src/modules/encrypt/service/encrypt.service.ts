import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { FailedToHashKey } from '../error/failed-to-hash-key';
import { FailedToCompareKey } from '../error/failed-to-compare-key';
import { PasswordDoesNotMatch } from '../error/password-does-not-match';

@Injectable()
export class EncryptService {
  constructor(private readonly configService: ConfigService) {}

  async hash(key: string): Promise<string> {
    const salt = this.getSalt();

    return await bcrypt.hash(key, Number(salt)).catch(() => {
      throw new FailedToHashKey();
    });
  }

  async compare(key: string, hashedKey: string): Promise<boolean> {
    return await bcrypt.compare(key, hashedKey).catch(() => {
      throw new FailedToCompareKey();
    });
  }

  async compareAndThrow(key: string, hashedKey: string): Promise<boolean> {
    const isSame = await this.compare(key, hashedKey);

    if (!isSame) {
      throw new PasswordDoesNotMatch();
    }

    return true;
  }

  private getSalt(): string {
    return this.configService.get<string>('encrypt.salt');
  }
}
