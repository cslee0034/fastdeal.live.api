import { Inject, InternalServerErrorException } from '@nestjs/common';
import { BaseErrorHandler } from '../../../../common/error/handler/base.error.handler';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { COUNTRIES_ERROR } from '../constant/countries.error.constant';
import { CreateCountryDto } from '../../dto/create-country.dto';
import { CreateTravelAlertDto } from '../../dto/create-travel-alert.dto';

export class CountriesErrorHandler extends BaseErrorHandler {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) protected readonly logger: Logger,
  ) {
    super(logger);
  }

  public create = ({
    error,
    inputs,
  }: {
    error: Error;
    inputs: CreateCountryDto;
  }): void => {
    this.logInputs(inputs);
    this.handleThrownError(error);
    throw new InternalServerErrorException(
      COUNTRIES_ERROR.CANNOT_CREATE_COUNTRY,
    );
  };

  public update = ({
    error,
    inputs,
  }: {
    error: Error;
    inputs: CreateCountryDto;
  }): void => {
    this.logInputs(inputs);
    this.handleThrownError(error);
    throw new InternalServerErrorException(
      COUNTRIES_ERROR.CANNOT_UPDATE_COUNTRY,
    );
  };

  public delete = ({
    error,
    inputs,
  }: {
    error: Error;
    inputs: CreateCountryDto;
  }): void => {
    this.logInputs(inputs);
    this.handleThrownError(error);
    throw new InternalServerErrorException(
      COUNTRIES_ERROR.CANNOT_DELETE_COUNTRY,
    );
  };

  public createTravelAlert = ({
    error,
    inputs,
  }: {
    error: Error;
    inputs: CreateTravelAlertDto;
  }): void => {
    this.logInputs(inputs);
    this.handleThrownError(error);
    throw new InternalServerErrorException(
      COUNTRIES_ERROR.CANNOT_CREATE_TRAVEL_ALERT,
    );
  };

  public getTravelAlerts = ({
    error,
    inputs,
  }: {
    error: Error;
    inputs: string;
  }): void => {
    this.logInputs(inputs);
    this.handleThrownError(error);
    throw new InternalServerErrorException(
      COUNTRIES_ERROR.CANNOT_GET_TRAVEL_ALERTS,
    );
  };
}
