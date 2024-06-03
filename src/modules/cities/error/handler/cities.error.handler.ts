import { Inject, InternalServerErrorException } from '@nestjs/common';
import { BaseErrorHandler } from '../../../../common/error/handler/base.error.handler';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CITIES_ERROR } from '../constant/cities.error';

export class CitiesErrorHandler extends BaseErrorHandler {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
  ) {
    super(logger);
  }

  public create({ error, inputs }: { error: Error; inputs: any }): void {
    this.logInputs(inputs);
    this.handleThrownError(error);
    throw new InternalServerErrorException(CITIES_ERROR.FAILED_TO_CREATE_CITY);
  }
}
