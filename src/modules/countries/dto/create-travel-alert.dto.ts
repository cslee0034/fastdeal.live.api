import { AlertStatus } from '@prisma/client';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateTravelAlertDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  nationalityCode: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  destinationCode: string;

  alertStatus: AlertStatus;
}
