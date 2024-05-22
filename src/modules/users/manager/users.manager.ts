import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { Provider } from '@prisma/client';
import { USERS_ERROR } from '../error/constant/users.error.constant';

@Injectable()
export class UsersManager {
  validateLocalUser(existingUser: UserEntity) {
    if (!existingUser) {
      return;
    }

    if (existingUser.provider !== Provider.local) {
      throw new ForbiddenException(
        `${USERS_ERROR.USER_ALREADY_EXISTS} with ${existingUser.provider} account`,
      );
    } else {
      throw new ForbiddenException(USERS_ERROR.USER_ALREADY_EXISTS);
    }
  }

  validateOauthUser(existingUser: UserEntity, provider: string) {
    if (!!existingUser && existingUser.provider !== provider) {
      throw new ForbiddenException(
        `${USERS_ERROR.USER_ALREADY_EXISTS} with ${existingUser.provider} account`,
      );
    }

    return;
  }
}
