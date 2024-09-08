import { IsString, IsUUID } from 'class-validator';

export class ApplyToSellerDto {
  @IsUUID()
  userId: string;

  @IsString()
  description: string;
}
