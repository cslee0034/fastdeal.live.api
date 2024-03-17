import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptService {
  constructor(private readonly configService: ConfigService) {}

  async hash(key: string): Promise<string> {
    try {
      const salt = this.configService.get<string>('encrypt.salt');
      return await bcrypt.hash(key, Number(salt));
    } catch (error) {
      throw new InternalServerErrorException('Failed to hash key');
    }
  }

  async compare(key: string, hashedKey: string): Promise<boolean> {
    try {
      return await bcrypt.compare(key, hashedKey);
    } catch (error) {
      throw new InternalServerErrorException('Failed to compare key');
    }
  }

  async compareAndThrow(key: string, hashedKey: string): Promise<void> {
    const isSame = await this.compare(key, hashedKey);
    if (!isSame) {
      throw new UnauthorizedException('Key does not match');
    }
    return;
  }
}
