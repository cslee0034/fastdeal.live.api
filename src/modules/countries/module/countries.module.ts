import { Module } from '@nestjs/common';
import { CountriesService } from '../service/countries.service';
import { CountriesController } from '../controller/countries.controller';
import { PrismaModule } from '../../../common/orm/prisma/module/prisma.module';
import { CountriesRepository } from '../repository/countries.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CountriesController],
  providers: [CountriesService, CountriesRepository],
})
export class CountriesModule {}
