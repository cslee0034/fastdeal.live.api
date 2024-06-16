import { Inject, InternalServerErrorException } from '@nestjs/common';
import { CommonErrorHandler } from '../../../../common/error/handler/common.error.handler';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { USERS_ERROR } from '../constant/users.error.constant';

export class UsersErrorHandler extends CommonErrorHandler {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
  ) {
    super(logger);
  }

  public createLocal({ error, inputs }: { error: Error; inputs: any }): void {
    inputs.password = '';
    super.logInputs(inputs);
    super.handleThrownError(error);
    throw new InternalServerErrorException(USERS_ERROR.FAILED_TO_CREATE_USER);
  }

  public findOrCreateOauth({
    error,
    inputs,
  }: {
    error: Error;
    inputs: any;
  }): void {
    super.logInputs(inputs);
    super.handleThrownError(error);
    throw new InternalServerErrorException(
      USERS_ERROR.FAILED_TO_FIND_OR_CREATE_OAUTH_USER,
    );
  }
}
