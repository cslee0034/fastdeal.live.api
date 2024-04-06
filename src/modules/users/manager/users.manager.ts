import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersManager {
  validateLocalUser(existingUser: UserEntity) {
    if (!existingUser) {
      return;
    }

    if (existingUser.provider !== 'local') {
      throw new ForbiddenException(
        `User already exists with ${existingUser.provider} provider`,
      );
    } else {
      throw new ForbiddenException('User already exists');
    }
  }

  validateOauthUser(existingUser: UserEntity) {
    if (!existingUser) {
      return;
    }

    if (existingUser.provider === 'local') {
      throw new ForbiddenException(
        `User already exists with ${existingUser.provider} provider`,
      );
    } else {
      throw new ForbiddenException('User already exists');
    }
  }
}
