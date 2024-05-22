import { Module } from '@nestjs/common';
import { CountriesService } from '../service/countries.service';
import { CountriesController } from '../controller/countries.controller';
import { PrismaModule } from '../../../common/orm/prisma/module/prisma.module';
import { CountriesRepository } from '../repository/countries.repository';
import { CountriesErrorHandler } from '../error/handler/country.error.handler';
import { LoggerModule } from '../../../common/module/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [CountriesController],
  providers: [CountriesService, CountriesRepository, CountriesErrorHandler],
})
export class CountriesModule {}
