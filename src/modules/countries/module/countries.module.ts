import { Module } from '@nestjs/common';
import { CountriesService } from '../service/countries.service';
import { CountriesController } from '../controller/countries.controller';

@Module({
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}
