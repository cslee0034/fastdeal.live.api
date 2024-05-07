import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { Provider } from '@prisma/client';

@Injectable()
export class UsersManager {
  validateLocalUser(existingUser: UserEntity) {
    if (!existingUser) {
      return;
    }

    if (existingUser.provider !== Provider.local) {
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

    if (existingUser.provider === Provider.local) {
      throw new ForbiddenException(
        `User already exists with ${existingUser.provider} provider`,
      );
    } else {
      throw new ForbiddenException('User already exists');
    }
  }
}
