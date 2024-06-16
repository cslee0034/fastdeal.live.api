import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ScoreCityDto {
  @IsNotEmpty()
  @IsString()
  cityId: string;

  @IsNotEmpty()
  @IsString()
  voterId: string;

  @IsNotEmpty()
  @IsNumber()
  totalScore: number;

  @IsNotEmpty()
  @IsNumber()
  internetSpeed: number;

  @IsNotEmpty()
  @IsNumber()
  costOfLiving: number;

  @IsNotEmpty()
  @IsNumber()
  tourism: number;

  @IsNotEmpty()
  @IsNumber()
  safety: number;
}
